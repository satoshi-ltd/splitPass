import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { style } from './InputMask.style';
import { Icon, Input, Pressable } from '../../design-system';
import { ICON } from '../../modules';

const MASK_CHAR = '*';

const InputMask = ({ actions, onChange, onRevealChange, revealed, showToggle = false, value = '', ...props }) => {
  const [internalReveal, setInternalReveal] = useState(false);
  const resolvedValue = `${value}`;
  const maskedValue = resolvedValue.replace(/[^\s]/g, MASK_CHAR);
  const isRevealControlled = typeof revealed === 'boolean';
  const isRevealed = isRevealControlled ? revealed : internalReveal;

  const handleChange = (nextValue = '') => {
    if (!onChange) return;
    if (isRevealed) return onChange(nextValue);
    if (!nextValue.length) return onChange('');

    if (nextValue.length >= resolvedValue.length) {
      return onChange(`${resolvedValue}${nextValue.substring(resolvedValue.length)}`);
    }

    return onChange(resolvedValue.substring(0, nextValue.length));
  };

  const handleToggleReveal = () => {
    const nextReveal = !isRevealed;
    if (!isRevealControlled) setInternalReveal(nextReveal);
    if (onRevealChange) onRevealChange(nextReveal);
  };

  const resolvedActions =
    showToggle || actions ? (
      <>
        {showToggle ? (
          <Pressable
            onPress={handleToggleReveal}
            style={[style.actionButton, !resolvedValue && style.actionButtonDisabled]}
          >
            <Icon name={isRevealed ? ICON.EYE_OFF : ICON.EYE} size="s" tone="secondary" />
          </Pressable>
        ) : null}
        {actions}
      </>
    ) : undefined;

  return (
    <Input
      {...props}
      autoCapitalize="none"
      autoCorrect={false}
      actions={resolvedActions}
      value={isRevealed ? resolvedValue : maskedValue}
      onChange={handleChange}
    />
  );
};

InputMask.propTypes = {
  actions: PropTypes.node,
  onRevealChange: PropTypes.func,
  revealed: PropTypes.bool,
  showToggle: PropTypes.bool,
  value: PropTypes.any,
  onChange: PropTypes.func,
};

export { InputMask };
