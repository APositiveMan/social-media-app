import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { type TextInput } from 'react-native';

import { Button } from '../components/Button';
import { FormScreen } from '../components/FormScreen';
import { TextField } from '../components/TextField';
import { useAuth } from '../lib/auth';
import {
  logIn,
  type LoginErrors,
  type LoginField,
  type LoginInput,
  normalizeLogin,
  validateLogin,
} from '../lib/login';

/** Sign in with an email or username and a password. */
export default function LoginScreen() {
  const { signIn } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const [values, setValues] = useState<LoginInput>({ identifier: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function update(field: LoginField) {
    return (text: string) => {
      setValues((v) => ({ ...v, [field]: text }));
      setErrors((e) => ({ ...e, [field]: undefined, form: undefined }));
    };
  }

  async function submit() {
    const input = normalizeLogin(values);
    const found = validateLogin(input);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setSubmitting(true);
    const result = await logIn(input);
    if (result.ok) {
      await signIn(result.data);
      router.dismissTo('/');
      return;
    }
    setErrors(result.errors);
    setSubmitting(false);
  }

  return (
    <FormScreen
      title="Log in"
      formError={errors.form}
      actions={
        <>
          <Button
            label={submitting ? 'Logging in…' : 'Log in'}
            disabled={submitting}
            onPress={submit}
          />
          <Button
            label="Create an account instead"
            variant="quiet"
            onPress={() => router.replace('/signup')}
          />
        </>
      }
    >
      <TextField
        label="Email or username"
        value={values.identifier}
        onChangeText={update('identifier')}
        error={errors.identifier}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef}
        label="Password"
        value={values.password}
        onChangeText={update('password')}
        error={errors.password}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
    </FormScreen>
  );
}
