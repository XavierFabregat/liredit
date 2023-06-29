import {
  ComponentWithAs,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputProps,
  Textarea,
  TextareaProps,
} from "@chakra-ui/react";
import { useField } from "formik";
import React, { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<
  HTMLInputElement & HTMLTextAreaElement
> & {
  name: string;
  label: string;
  textarea?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  size: _,
  textarea,
  ...props
}) => {
  let InputOrTextarea:
    | ComponentWithAs<"input", InputProps>
    | ComponentWithAs<"textarea", TextareaProps> = Input;
  if (textarea) {
    InputOrTextarea = Textarea;
  }
  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <InputOrTextarea
        id={field.name}
        placeholder={props.placeholder}
        {...field}
        {...props}
      />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};

export default InputField;
