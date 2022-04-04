import React, { useCallback, useRef } from 'react';
import { FiLogIn, FiMail, FiLock } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/auth';
import { useToast } from '../../hooks/toast';
import Input from '../../components/Input';
import Button from '../../components/Button';

import getValidationsErrors from '../../utils/getValidationErrors';

import { Container, Content, AnimationContainer, Background } from './styles';
import logo from '../../assets/logo.svg';

interface SignInFormData {
    cpfcnpj: string;
    password: string;
  }

const SignIn: React.FC = () => {
    const formRef = useRef<FormHandles>(null);

    const { signIn } = useAuth();
    const { addToast } = useToast();

    const handleSubmit = useCallback(
        async (data: SignInFormData) => {
          try {
              debugger;
            formRef.current?.setErrors({});

            const schema = Yup.object().shape({
                cpfcnpj: Yup.string().required('CPF/CNPJ é obrigatório.'),
                password: Yup.string().required('Senha é obrigatória.'),
            })

            await schema.validate(data, {
                abortEarly: false,
            });

            await signIn({
                cpfcnpj: data.cpfcnpj,
                password: data.password,
            });
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
              const errors = getValidationsErrors(err);
              formRef.current?.setErrors(errors);
            }
    
            addToast({
              type: 'error',
              title: 'Erro no Login!',
              description:
                'Ocorreu um erro ao realizar login, por favor verifique as credenciais ou crie uma conta.',
            });
        }
        },
        [signIn, addToast],
      );

    return (
        <Container>
        <Content>
            <AnimationContainer>
            <img src={logo} alt="GoBarber" />

            <Form ref={formRef} onSubmit={handleSubmit}>
                <h1>Faça seu logon</h1>

                <Input name="cpfcnpj" placeholder="CPF/CNPJ" icon={FiMail} />
                <Input
                name="password"
                type="password"
                placeholder="Senha"
                icon={FiLock}
                />
                <Button type="submit">Entrar</Button>

                <Link to="/forgot-password">Esqueci minha senha</Link>
            </Form>

            <Link to="/signup">
                <FiLogIn />
                Criar conta
            </Link>
            </AnimationContainer>
        </Content>
        <Background />
        </Container>
    );
};

export default SignIn;