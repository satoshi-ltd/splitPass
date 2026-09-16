/**
 * @jest-environment jsdom
 */

require('../lib/form-scan.js');

const {
  distributeCode,
  isLikelyPasswordField,
  mutationTouchesInputs,
  scoreOtp,
  scoreUsername,
  selectOtpTargets,
  selectPasswordTargets,
  selectUsernameField,
} = globalThis.SplitPassFormScan;

const render = (html) => {
  document.body.innerHTML = html;
  return document.body;
};

const inputsIn = (selector = 'input') => Array.from(document.querySelectorAll(selector));

afterEach(() => {
  document.body.innerHTML = '';
});

describe('selectPasswordTargets', () => {
  const passwordInput = (autocomplete = '') => {
    const input = document.createElement('input');
    input.type = 'password';
    if (autocomplete) input.autocomplete = autocomplete;
    return input;
  };

  it('fills only the current password on a change-password form', () => {
    const current = passwordInput('current-password');
    const fresh = passwordInput('new-password');
    const confirm = passwordInput('new-password');

    expect(selectPasswordTargets([current, fresh, confirm])).toEqual([current]);
  });

  it('fills both new-password fields on a sign-up form', () => {
    const fresh = passwordInput('new-password');
    const confirm = passwordInput('new-password');
    const other = passwordInput();

    expect(selectPasswordTargets([other, fresh, confirm])).toEqual([fresh, confirm]);
  });

  it('fills one or two unhinted fields as they are', () => {
    const only = passwordInput();
    const first = passwordInput();
    const second = passwordInput();

    expect(selectPasswordTargets([only])).toEqual([only]);
    expect(selectPasswordTargets([first, second])).toEqual([first, second]);
    expect(selectPasswordTargets([])).toEqual([]);
  });

  it('falls back to the focused field, then the first, when three or more are unhinted', () => {
    const first = passwordInput();
    const second = passwordInput();
    const third = passwordInput();

    expect(selectPasswordTargets([first, second, third], second)).toEqual([second]);
    expect(selectPasswordTargets([first, second, third], passwordInput())).toEqual([first]);
    expect(selectPasswordTargets([first, second, third])).toEqual([first]);
  });
});

describe('isLikelyPasswordField', () => {
  it('accepts a real password input', () => {
    render('<input type="password" />');
    expect(isLikelyPasswordField(inputsIn()[0])).toBe(true);
  });

  it('accepts a revealed password that a show/hide toggle switched to text', () => {
    render('<input type="text" name="password" autocomplete="current-password" />');
    expect(isLikelyPasswordField(inputsIn()[0])).toBe(true);
  });

  it('accepts a revealed field labelled in Spanish or German', () => {
    render('<input type="text" name="contrasena" /><input type="text" id="kennwort" />');
    inputsIn().forEach((input) => expect(isLikelyPasswordField(input)).toBe(true));
  });

  it('rejects ordinary text fields, including passport and lookalikes', () => {
    render('<input type="text" name="passport_number" /><input type="text" name="email" /><input type="search" name="q" />');
    inputsIn().forEach((input) => expect(isLikelyPasswordField(input)).toBe(false));
  });
});

describe('selectUsernameField', () => {
  it('picks the username field on a classic login form', () => {
    render(`
      <form>
        <input type="text" name="username" />
        <input type="password" name="password" />
      </form>
    `);
    const [username, password] = inputsIn();

    expect(selectUsernameField([username], { passwordField: password })).toBe(username);
  });

  it('ignores a site search box outside the login form', () => {
    render(`
      <input type="text" name="q" placeholder="Search products" />
      <form>
        <input type="text" id="login-email" />
        <input type="password" />
      </form>
    `);
    const [search, email, password] = inputsIn();

    expect(selectUsernameField([search, email], { passwordField: password })).toBe(email);
    expect(scoreUsername(search)).toBeLessThan(0);
  });

  it('reads the visible label when the attributes say nothing', () => {
    render(`
      <form>
        <label for="f1">Correo electrónico</label>
        <input type="text" id="f1" />
        <input type="password" />
      </form>
    `);
    const [username, password] = inputsIn();

    expect(selectUsernameField([username], { passwordField: password })).toBe(username);
  });

  it('reads aria-label across the supported languages', () => {
    const labels = ["Nom d'utilisateur", 'Benutzername', 'Nome de usuário', 'Nombre de usuario'];

    labels.forEach((label) => {
      render(`<form><input type="text" aria-label="${label}" /><input type="password" /></form>`);
      const [username, password] = inputsIn();
      expect(selectUsernameField([username], { passwordField: password })).toBe(username);
    });
  });

  it('falls back to the field above the password when every attribute is hashed', () => {
    render(`
      <form>
        <input type="text" class="sc-1x2y3z" name="a11y-4f2" />
        <input type="password" class="sc-9q8w7e" />
      </form>
    `);
    const [username, password] = inputsIn();

    expect(selectUsernameField([username], { passwordField: password })).toBe(username);
  });

  it('never falls back to a search box, even with nothing else on the page', () => {
    render(`
      <form>
        <input type="search" name="q" placeholder="Buscar" />
        <input type="password" />
      </form>
    `);
    const [search, password] = inputsIn();

    expect(selectUsernameField([search], { passwordField: password })).toBeNull();
  });

  it('prefers the email field over an unrelated first/last name field', () => {
    render(`
      <form>
        <input type="text" name="firstname" />
        <input type="email" name="contact" />
        <input type="password" />
      </form>
    `);
    const [first, email, password] = inputsIn();

    expect(selectUsernameField([first, email], { passwordField: password })).toBe(email);
  });

  it('prefers a candidate inside the password form over a better-named one outside it', () => {
    render(`
      <input type="text" name="username" id="newsletter-user" />
      <form>
        <input type="text" id="signin-account" />
        <input type="password" />
      </form>
    `);
    const [outside, inside, password] = inputsIn();

    expect(selectUsernameField([outside, inside], { passwordField: password })).toBe(inside);
  });

  it('still works on a username-first page with no password field at all', () => {
    render('<form><input type="text" name="usuario" /></form>');
    const [username] = inputsIn();

    expect(selectUsernameField([username], { passwordField: null })).toBe(username);
  });

  it('returns null when there is nothing to fill', () => {
    expect(selectUsernameField([], { passwordField: null })).toBeNull();
  });
});

describe('selectOtpTargets', () => {
  it('picks a field flagged with the one-time-code autocomplete', () => {
    render('<input type="text" autocomplete="one-time-code" />');
    const [otp] = inputsIn();

    expect(selectOtpTargets([otp])).toEqual({ inputs: [otp], segmented: false });
  });

  it('picks a single field named for 2FA in each supported language', () => {
    ['Verification code', 'Código de verificación', 'Code de vérification', 'Bestätigungscode', 'Código de verificação'].forEach(
      (label) => {
        render(`<input type="text" aria-label="${label}" maxlength="6" />`);
        const [otp] = inputsIn();
        expect(selectOtpTargets([otp])?.inputs).toEqual([otp]);
      }
    );
  });

  it('detects a six-box segmented code, each box wrapped in its own div', () => {
    render(`
      <div><div><input maxlength="1" /></div><div><input maxlength="1" /></div><div><input maxlength="1" /></div>
      <div><input maxlength="1" /></div><div><input maxlength="1" /></div><div><input maxlength="1" /></div></div>
    `);
    const boxes = inputsIn();
    const result = selectOtpTargets(boxes);

    expect(result.segmented).toBe(true);
    expect(result.inputs).toHaveLength(6);
  });

  it('detects a four-box segmented code when the boxes are named for a code', () => {
    render(`
      <input maxlength="1" name="otp-1" /><input maxlength="1" name="otp-2" />
      <input maxlength="1" name="otp-3" /><input maxlength="1" name="otp-4" />
    `);

    expect(selectOtpTargets(inputsIn()).segmented).toBe(true);
  });

  it('ignores a promo code and a postcode field', () => {
    render('<input type="text" name="promo_code" maxlength="6" /><input type="text" name="postcode" maxlength="5" />');
    inputsIn().forEach((input) => expect(scoreOtp(input)).toBeLessThan(0));
    expect(selectOtpTargets(inputsIn())).toBeNull();
  });

  it('ignores a plain search box and a password field', () => {
    render('<input type="search" name="q" /><input type="password" />');
    expect(selectOtpTargets(inputsIn())).toBeNull();
  });

  it('returns null when nothing looks like a code', () => {
    render('<input type="text" name="street" /><input type="email" name="email" />');
    expect(selectOtpTargets(inputsIn())).toBeNull();
  });
});

describe('distributeCode', () => {
  it('spreads a code one digit per box and pads a short one', () => {
    expect(distributeCode('123456', 6)).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(distributeCode('1234', 6)).toEqual(['1', '2', '3', '4', '', '']);
  });

  it('keeps the whole code for a single field', () => {
    expect(distributeCode('123456', 1)).toEqual(['123456']);
    expect(distributeCode('123456', 0)).toEqual(['123456']);
  });
});

describe('mutationTouchesInputs', () => {
  it('reacts to inputs and their containers, and ignores unrelated nodes', () => {
    const form = document.createElement('form');
    const password = document.createElement('input');
    password.type = 'password';
    form.appendChild(password);
    const banner = document.createElement('div');
    banner.textContent = 'hello';

    expect(mutationTouchesInputs({ type: 'attributes', target: form })).toBe(true);
    expect(mutationTouchesInputs({ type: 'attributes', target: password })).toBe(true);
    expect(mutationTouchesInputs({ type: 'attributes', target: banner })).toBe(false);
    expect(mutationTouchesInputs({ type: 'childList', addedNodes: [banner], removedNodes: [] })).toBe(false);
    expect(mutationTouchesInputs({ type: 'childList', addedNodes: [], removedNodes: [form] })).toBe(true);
    expect(mutationTouchesInputs({ type: 'childList', addedNodes: [document.createTextNode('x')], removedNodes: [] })).toBe(false);
    expect(mutationTouchesInputs({ type: 'characterData', target: banner })).toBe(false);
    expect(mutationTouchesInputs(null)).toBe(false);
  });
});

describe('isOtpField', () => {
  const { isOtpField } = globalThis.SplitPassFormScan;

  it('recognises a named code field and a single segment box without scanning the page', () => {
    render('<input type="text" name="verification_code" /><input maxlength="1" />');
    inputsIn().forEach((input) => expect(isOtpField(input)).toBe(true));
  });

  it('stays away from promo codes, search boxes and plain text fields', () => {
    render('<input name="promo_code" /><input type="search" name="q" /><input type="text" name="street" />');
    inputsIn().forEach((input) => expect(isOtpField(input)).toBe(false));
  });
});
