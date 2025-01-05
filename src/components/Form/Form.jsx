import { Button, Card, Input, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { style } from './Form.style';
import { ICON } from '../../modules';

const Form = ({ fields, onCancel = () => {}, onSubmit = () => {} }) => {
  const [value, setValue] = useState([]);

  useEffect(() => {
    setValue({});
  }, [fields]);

  const handleCancel = () => {
    onCancel();
  };

  const handleSubmit = () => {
    onSubmit(value);
  };

  return (
    <Card gap outlined row small style={style.container}>
      <View gap>
        {fields?.map((field) => (
          <Input
            {...field}
            key={field.name}
            value={value[field.name]}
            onChange={(fieldValue) => setValue({ ...value, [field.name]: fieldValue })}
            style={style.input}
          />
        ))}
      </View>
      <View gap row>
        <Button
          disabled={fields?.filter(({ name }) => !value[name]).length !== 0}
          icon={ICON.CHECK}
          secondary
          small
          onPress={handleSubmit}
        />
        <Button icon={ICON.CLOSE} small onPress={handleCancel} />
      </View>
    </Card>
  );
};

Form.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
    }),
  ),
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
};

export { Form };
