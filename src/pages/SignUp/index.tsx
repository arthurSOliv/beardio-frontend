import React, { useCallback, useRef, useState } from 'react';
import { FiArrowLeft, FiMail, FiUser, FiLock } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { Link, useHistory } from 'react-router-dom';
import { useToast } from '../../hooks/toast';

import api from '../../services/api';

import Input from '../../components/Input';
import Button from '../../components/Button';
import HighlitedButton from '../../components/HighlitedButton';

import getValidationsErrors from '../../utils/getValidationErrors';

import logo from '../../assets/logo.svg';

import { Container, ContainerRow, Content, AnimationContainer, Background } from './styles';

interface SignUpFormData {
  name: string;
  cpf?: string;
  cnpj?: string;
  email: string;
  password: string;
}

const SignUp: React.FC = () => {
  const history = useHistory();
  const { addToast } = useToast();
  const formRef = useRef<FormHandles>(null);
  const [type, setType] = useState('client');

  const handleSubmit = useCallback(
    async (data: SignUpFormData) => {
        try {
            formRef.current?.setErrors({});

            const schema = Yup.object().shape({
                name: Yup.string().required('Nome é obrigatório.'),
                cpf: type === 'client' ? Yup.string().required('CPF é obrigatório.') : Yup.string(),
                cnpj: type === 'provider' ? Yup.string().required('CNPJ é obrigatório.') : Yup.string(),
                email: Yup.string().required('E-mail é obrigatório.').email('Digite um E-mail válido.'),
                password: Yup.string().min(6, 'Senha deve conter no mínimo 6 dígitos.'),
            })

            debugger;

            await schema.validate(data, {
                abortEarly: false,
            });

            await api.post('/users', data);

            addToast({
              type: 'success',
              title: 'Cadastro realizado!',
              description: 'Você já pode fazer seu logon.',
            });

            history.push('/');
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
              const errors = getValidationsErrors(err);
              formRef.current?.setErrors(errors);
            }
    
            addToast({
              type: 'error',
              title: 'Erro no cadastro!',
              description:
                'Ocorreu um erro ao enviar dados, por favor tente novamente.',
            });
        }
    },
    [type, addToast],
  );

  return (
    <Container>
      <Background />

      <Content>
        <AnimationContainer>
          <img src={logo} alt="GoBarber" />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Faça seu cadastro</h1>

            <ContainerRow>
                <HighlitedButton selected={type === 'client'} onClick={() => setType('client')}>Sou cliente</HighlitedButton>
                <HighlitedButton selected={type === 'provider'} onClick={() => setType('provider')}>Sou prestador</HighlitedButton>
            </ContainerRow>

            <Input name="name" placeholder="Nome" icon={FiUser} />
            {
                type === 'client' ?
                    <Input name="cpf" placeholder="CPF" icon={FiMail} />
                :
                    <Input name="cnpj" placeholder="CNPJ" icon={FiMail} />
            }
            <Input name="email" placeholder="E-mail" icon={FiMail} />
            <Input
              name="password"
              type="password"
              placeholder="Senha"
              icon={FiLock}
            />
            <Button type="submit">Cadastrar</Button>
          </Form>

          <Link to="/">
            <FiArrowLeft />
            Voltar para logon
          </Link>
        </AnimationContainer>
      </Content>
    </Container>
  );
};

export default SignUp;