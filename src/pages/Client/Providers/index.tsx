import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { isToday, format, parseISO, isAfter } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';
import DayPicker, { DayModifiers } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import { FiPower, FiUser, FiArrowRight } from 'react-icons/fi';

import { Link } from 'react-router-dom';
import {
  Container,
  Header,
  HeaderContainer,
  Profile,
  Content,
  Schedule,
  Section,
  ProviderBox,
} from './styles';

import api from '../../../services/api';

import logo from '../../../assets/logo.svg';
import { useAuth } from '../../../hooks/auth';

interface IProviders {
  id: string,
  user_id: string,
  email: string,
  name: string,
  cnpj: string,
  avatar: string
}

const Providers: React.FC = () => {
  const { signOut, user } = useAuth();

  const [providers, setProviders] = useState<IProviders[]>([]);

  useEffect(() => {
    api
      .get<IProviders[]>('providers')
      .then(({ data }) => {
        setProviders(data);
      });
  }, []);

  return (
    <Container>
      <Header>
        <HeaderContainer>
          <img src={logo} alt="GoBarber" />

          <Profile>
            <img src={user.avatar ? `https://beardio-files.s3.amazonaws.com/${user.avatar}` : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt={user.name} />
            <div>
              <span>Bem-vindo Cliente,</span>

              <Link to="/clientProfile">
                <strong>{user.name}</strong>
              </Link>
            </div>
          </Profile>

          <button type="button" onClick={signOut}>
            <FiPower />
          </button>
        </HeaderContainer>
      </Header>

      <Content>
        <Schedule>
          <h1>Barbeiros</h1>

          <Section>
            {providers.length === 0 && (
              <p>Nenhum barbeiro encontrado</p>
            )}

            {providers.map(provider => (
              <ProviderBox key={provider.id}>
                <Link to={`/provider/${provider.user_id}`}>
                  <div>
                    <div>
                      <img
                        src={provider.avatar ? `https://beardio-files.s3.amazonaws.com/${provider.avatar}` : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                        alt={provider.name}
                      />
                      <strong>{provider.name}</strong>
                    </div>
                    <FiArrowRight />
                  </div>
                </Link>
              </ProviderBox>
            ))}
          </Section>
        </Schedule>
      </Content>
    </Container>
  );
};

export default Providers;