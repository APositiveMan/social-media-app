import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, type TextInput, View } from 'react-native';

import { Button } from '../components/Button';
import { FormScreen } from '../components/FormScreen';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { useAuth } from '../lib/auth';
import type { Account } from '../lib/auth-types';
import {
  normalizeSignup,
  PASSWORD_MIN_LENGTH,
  type SignupErrors,
  type SignupField,
  type SignupInput,
  signUp,
  validateSignup,
} from '../lib/signup';
import { spacing, type, useColors } from '../theme';

/** Create an account with a username, email, and password. */
export default function SignupScreen() {
  const colors = useColors();
  const { signIn } = useAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [values, setValues] = useState<SignupInput>({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState<SignupErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);

  function update(field: SignupField) {
    return (text: string) => {
      setValues((v) => ({ ...v, [field]: text }));
      setErrors((e) => ({ ...e, [field]: undefined, form: undefined }));
    };
  }

  async function submit() {
    const input = normalizeSignup(values);
    const found = validateSignup(input);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setSubmitting(true);
    const result = await signUp(input);
    if (result.ok) {
      await signIn(result.data);
      setAccount(result.data.account);
    } else {
      setErrors(result.errors);
    }
    setSubmitting(false);
  }

  if (account) {
    return (
      <Screen centered>
        <View style={styles.text}>
          <Text accessibilityRole="header" style={[type.title, { color: colors.text }]}>
            Welcome, {account.username}.
          </Text>
          <Text style={[type.body, { color: colors.muted }]}>Your account is ready.</Text>
        </View>
        <Button label="Start reading" onPress={() => router.replace('/story')} />
      </Screen>
    );
  }

  return (
    <FormScreen
      title="Create an account"
      formError={errors.form}
      actions={
        <>
          <Button
            label={submitting ? 'Creating account…' : 'Create account'}
            disabled={submitting}
            onPress={submit}
          />
          <Button
            label="I already have an account"
            variant="quiet"
            onPress={() => router.replace('/login')}
          />
        </>
      }
    >
      <TextField
        label="Username"
        value={values.username}
        onChangeText={update('username')}
        error={errors.username}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <TextField
        ref={emailRef}
        label="Email"
        value={values.email}
        onChangeText={update('email')}
        error={errors.email}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef}
        label="Password"
        placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
        value={values.password}
        onChangeText={update('password')}
        error={errors.password}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  text: { gap: spacing.lg, marginBottom: spacing.xxl },
});
