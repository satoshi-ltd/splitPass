(function attachSplitPassFormScan(globalScope) {
  const MIN_USERNAME_SCORE = 4;
  const MIN_OTP_SCORE = 4;
  const MIN_REVEALED_PASSWORD_SCORE = 8;
  const SEGMENTED_OTP_MIN = 4;
  const SEGMENTED_OTP_MAX = 12;
  const FILLABLE_TYPES = new Set(['text', 'email', 'tel', 'number', 'search', 'url', 'password', '']);
  const SIGNAL_ATTRIBUTES = [
    'name', 'id', 'autocomplete', 'placeholder', 'title', 'aria-label', 'data-testid', 'data-test', 'class',
  ];

  // Terms are matched against the normalized signal string; `word: true` demands a whole-token hit
  // so that generic stems (pass, code, pin, mail) cannot fire inside passport, barcode or pinterest.
  const USERNAME_RULES = [
    {
      score: 12,
      terms: [
        'username', 'user name', 'userid', 'user id', 'loginname', 'login name', 'signinname',
        'nombre de usuario', 'nombre usuario', 'nome de usuario', 'nome utilizador',
        'nom d utilisateur', 'nom utilisateur', 'benutzername', 'anmeldename',
      ],
    },
    {
      score: 10,
      terms: ['email', 'e mail', 'correo electronico', 'courriel', 'emailaddress', 'email address', 'epost', 'e post'],
    },
    {
      score: 8,
      terms: [
        'usuario', 'utilizador', 'utilisateur', 'benutzer', 'identifiant', 'identificador', 'kennung',
        'correo', 'mail', 'login', 'signin', 'sign in', 'anmelden',
      ],
      word: true,
    },
    {
      score: 5,
      terms: [
        'user', 'account', 'cuenta', 'conta', 'compte', 'konto', 'member', 'miembro', 'mitglied',
        'customer', 'cliente', 'client', 'kunde', 'handle', 'nickname', 'nick', 'pseudo', 'alias',
      ],
      word: true,
    },
    { score: 4, terms: ['dni', 'nif', 'nie', 'cedula', 'rut', 'cpf', 'documento', 'matricula'], word: true },
  ];

  const PASSWORD_RULES = [
    {
      score: 12,
      terms: [
        'password', 'passwort', 'kennwort', 'passphrase', 'contrasena', 'contrasenha', 'senha',
        'mot de passe', 'motdepasse', 'palavra passe', 'passwd',
      ],
    },
    { score: 6, terms: ['pass', 'pwd', 'clave', 'passe'], word: true },
  ];

  const OTP_RULES = [
    {
      score: 12,
      terms: [
        'one time', 'onetime', 'one time code', 'otp', 'totp', 'two factor', 'twofactor', '2fa', 'mfa',
        'authenticator', 'authcode', 'auth code', 'verification code', 'verificationcode', 'security code',
        'securitycode', 'confirmation code', 'sms code', 'einmalcode', 'bestatigungscode', 'sicherheitscode',
        'codigo de verificacion', 'codigo de seguridad', 'codigo de confirmacion', 'code de verification',
        'code de securite', 'codigo de verificacao',
      ],
    },
    {
      score: 7,
      terms: [
        'verification', 'verificacion', 'verificacao', 'verifizierung',
        'authentication', 'autenticacion', 'autenticacao', 'authentification',
      ],
      word: true,
    },
    { score: 4, terms: ['code', 'codigo', 'token', 'pin'], word: true },
  ];

  // Shared vetoes: a field that looks like search, marketing or checkout must never receive a secret.
  const NEGATIVE_RULES = [
    {
      score: 20,
      terms: [
        'search', 'buscar', 'busqueda', 'busca', 'pesquisa', 'recherche', 'chercher', 'suche', 'suchen',
        'captcha', 'promo', 'promotion', 'promocode', 'coupon', 'cupon', 'voucher', 'gutschein', 'descuento',
        'discount', 'referral', 'invite code', 'giftcard', 'gift card', 'newsletter',
      ],
    },
    {
      score: 20,
      terms: [
        'cardnumber', 'card number', 'creditcard', 'credit card', 'cvv', 'cvc', 'expiry', 'expiration',
        'tarjeta', 'carte bancaire', 'kreditkarte', 'iban', 'swift',
      ],
    },
    {
      score: 12,
      terms: [
        'phone', 'telephone', 'telefono', 'telefone', 'mobile', 'movil', 'handy',
        'address', 'direccion', 'endereco', 'adresse', 'street', 'calle', 'city', 'ciudad', 'ville', 'stadt',
        'zip', 'postal', 'postcode', 'plz', 'country', 'pais', 'company', 'empresa',
        'firstname', 'first name', 'lastname', 'last name', 'surname', 'fullname', 'full name',
        'nombre completo', 'apellido', 'sobrenome', 'vorname', 'nachname', 'prenom',
        'birthday', 'birthdate', 'fecha', 'comment', 'message', 'mensaje', 'subject', 'quantity', 'cantidad',
      ],
    },
    { score: 8, terms: ['q', 'query', 'filter', 'filtro', 'filtre', 'keyword', 'term'], word: true },
  ];

  function stripAccents(value) {
    return String(value || '')
      .replace(/ß/g, 'ss')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  function normalizeText(value) {
    return stripAccents(value)
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function labelTextFor(input) {
    const documentRef = input?.ownerDocument;
    if (!documentRef) return '';

    const parts = [];
    const describedBy = String(input.getAttribute?.('aria-labelledby') || '').trim();

    describedBy
      .split(/\s+/)
      .filter(Boolean)
      .forEach((id) => {
        parts.push(documentRef.getElementById(id)?.textContent || '');
      });

    // input.labels covers both `<label for>` and a wrapping label, with no selector escaping.
    Array.from(input.labels || []).forEach((label) => {
      parts.push(label.textContent || '');
    });

    parts.push(input.closest?.('label')?.textContent || '');

    return parts.join(' ');
  }

  function fieldSignals(input) {
    if (!input) return '';

    const attributes = SIGNAL_ATTRIBUTES.map((attribute) => input.getAttribute?.(attribute) || '').join(' ');

    return normalizeText(`${attributes} ${labelTextFor(input)} ${input.type || ''}`);
  }

  function matchesRule(signals, rule) {
    const padded = ` ${signals} `;
    return rule.terms.some((term) => (rule.word ? padded.includes(` ${term} `) : signals.includes(term)));
  }

  function scoreRules(signals, rules) {
    return rules.reduce((total, rule) => (matchesRule(signals, rule) ? total + rule.score : total), 0);
  }

  function negativeScore(signals) {
    return scoreRules(signals, NEGATIVE_RULES);
  }

  function autocompleteOf(input) {
    return normalizeText(input?.getAttribute?.('autocomplete') || input?.autocomplete || '');
  }

  function scoreUsername(input) {
    const signals = fieldSignals(input);
    const autocomplete = autocompleteOf(input);
    const bonus = ['username', 'email'].includes(autocomplete) ? 14 : 0;
    const typeBonus = String(input?.type || '').toLowerCase() === 'email' ? 8 : 0;

    return scoreRules(signals, USERNAME_RULES) + bonus + typeBonus - negativeScore(signals);
  }

  function scorePassword(input) {
    const signals = fieldSignals(input);
    const autocomplete = autocompleteOf(input);
    const bonus = ['current password', 'new password'].includes(autocomplete) ? 14 : 0;

    return scoreRules(signals, PASSWORD_RULES) + bonus - negativeScore(signals);
  }

  function scoreOtp(input) {
    const signals = fieldSignals(input);
    const autocomplete = autocompleteOf(input);
    if (autocomplete === 'one time code') return 40;

    const maxLength = Number(input?.maxLength) > 0 ? Number(input.maxLength) : 0;
    const shapeBonus = maxLength >= 4 && maxLength <= 8 ? 3 : 0;
    const inputMode = normalizeText(input?.inputMode || input?.getAttribute?.('inputmode') || '');
    const numericBonus = inputMode === 'numeric' ? 2 : 0;

    return scoreRules(signals, OTP_RULES) + shapeBonus + numericBonus - negativeScore(signals);
  }

  function isFillableType(input) {
    return FILLABLE_TYPES.has(String(input?.type || '').toLowerCase());
  }

  function isLikelyPasswordField(input) {
    if (!isFillableType(input)) return false;
    if (String(input?.type || '').toLowerCase() === 'password') return true;

    // A "show password" toggle swaps the field to type=text, so fall back to intent signals.
    return scorePassword(input) >= MIN_REVEALED_PASSWORD_SCORE;
  }

  function selectPasswordTargets(inputs = [], preferred = null) {
    const current = inputs.filter((input) => autocompleteOf(input) === 'current password');
    if (current.length) return current;

    const fresh = inputs.filter((input) => autocompleteOf(input) === 'new password');
    if (fresh.length) return fresh;

    if (inputs.length <= 2) return inputs.slice();
    return [preferred && inputs.includes(preferred) ? preferred : inputs[0]];
  }

  function sharesForm(left, right) {
    const leftForm = left?.form || left?.closest?.('form') || null;
    const rightForm = right?.form || right?.closest?.('form') || null;
    return !!leftForm && leftForm === rightForm;
  }

  function precedes(left, right) {
    if (!left || !right || typeof left.compareDocumentPosition !== 'function') return false;
    return !!(left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING);
  }

  function selectUsernameField(candidates = [], { passwordField = null } = {}) {
    const usable = candidates.filter((input) => input && isFillableType(input) && !isLikelyPasswordField(input));
    if (!usable.length) return null;

    const ranked = usable
      .map((input) => {
        const sameForm = passwordField ? sharesForm(input, passwordField) : false;
        const before = passwordField ? precedes(input, passwordField) : false;
        const structural = (sameForm ? 6 : 0) + (before ? 3 : 0) - (passwordField && !sameForm && !before ? 4 : 0);
        return { input, score: scoreUsername(input) + structural, sameForm, before };
      })
      .sort((left, right) => right.score - left.score);

    const best = ranked[0];
    if (best.score >= MIN_USERNAME_SCORE) return best.input;

    // Attribute names can be meaningless (hashed React props); the field just above the password still wins.
    const structuralFallback = ranked
      .filter((entry) => entry.before && (entry.sameForm || !passwordField?.form))
      .filter((entry) => negativeScore(fieldSignals(entry.input)) === 0)
      .sort((left, right) => (precedes(left.input, right.input) ? 1 : -1))[0];

    return structuralFallback?.input || null;
  }

  function isSegmentCandidate(input) {
    return isFillableType(input) && Number(input?.maxLength) === 1;
  }

  function isOtpField(input) {
    return isFillableType(input) && (isSegmentCandidate(input) || scoreOtp(input) >= MIN_OTP_SCORE);
  }

  function groupSegments(inputs = []) {
    const groups = [];
    let current = [];

    inputs.forEach((input) => {
      if (isSegmentCandidate(input)) {
        current.push(input);
        return;
      }
      if (current.length) groups.push(current);
      current = [];
    });

    if (current.length) groups.push(current);
    return groups.filter((group) => group.length >= SEGMENTED_OTP_MIN && group.length <= SEGMENTED_OTP_MAX);
  }

  function selectOtpTargets(inputs = []) {
    const usable = inputs.filter((input) => input && isFillableType(input) && !isLikelyPasswordField(input));

    const segmentGroup = groupSegments(usable).find((group) =>
      group.some((input) => scoreOtp(input) >= MIN_OTP_SCORE) || group.length === 6
    );
    if (segmentGroup) return { inputs: segmentGroup, segmented: true };

    const best = usable
      .filter((input) => !isSegmentCandidate(input))
      .map((input) => ({ input, score: scoreOtp(input) }))
      .sort((left, right) => right.score - left.score)[0];

    return best && best.score >= MIN_OTP_SCORE ? { inputs: [best.input], segmented: false } : null;
  }

  function distributeCode(code = '', count = 1) {
    const digits = String(code || '');
    if (count <= 1) return [digits];
    return Array.from({ length: count }, (unused, index) => digits[index] || '');
  }

  function touchesInputs(node) {
    return node instanceof Element && (node.matches('input') || node.querySelector('input') !== null);
  }

  function mutationTouchesInputs(mutation) {
    if (mutation?.type === 'attributes') return touchesInputs(mutation.target);
    if (mutation?.type === 'childList') {
      return [...(mutation.addedNodes || []), ...(mutation.removedNodes || [])].some(touchesInputs);
    }
    return false;
  }

  globalScope.SplitPassFormScan = {
    distributeCode,
    fieldSignals,
    isLikelyPasswordField,
    isOtpField,
    mutationTouchesInputs,
    scoreOtp,
    scorePassword,
    scoreUsername,
    selectOtpTargets,
    selectPasswordTargets,
    selectUsernameField,
  };
})(globalThis);
