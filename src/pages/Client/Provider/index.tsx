import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { isToday, format } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';
import DayPicker, { DayModifiers } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import { FiPower, FiUser } from 'react-icons/fi';

import { Link, useParams } from 'react-router-dom';

import { useToast } from '../../../hooks/toast';

import {
  Container,
  Header,
  HeaderContainer,
  Profile,
  Content,
  Schedule,
  NexAppointment,
  ProviderBox,
  Hour,
  Calendar,
  Section,
  ProfileButton
} from './styles';

import api from '../../../services/api';

import logo from '../../../assets/logo.svg';
import { useAuth } from '../../../hooks/auth';

interface Appointment {
  id: string;
  date: string;
  hourFormatted: string;
  status: any;
  client: {
    name: string;
    avatar: string;
  };
}

interface IProvider {
  id: string,
  user_id: string,
  email: string,
  name: string,
  cnpj: string,
  avatar: string
}

interface IParams {
  id: string;
}

interface IAvailabilityItem {
  hour: number;
  available: boolean;
}

const Provider: React.FC = () => {
  const { signOut, user } = useAuth();

  const { id } = useParams<IParams>();

  const { addToast } = useToast();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availability, setAvailability] = useState<IAvailabilityItem[]>([]);
  const [selectedHour, setSelectedHour] = useState<number>();
  const [provider, setProvider] = useState<IProvider>();

  const handleDateChange = useCallback((day: Date, modifiers: DayModifiers) => {
    if (modifiers.available && !modifiers.disabled) setSelectedDate(day);
  }, []);

  useEffect(() => {
    if(provider) {
      api.get(`providers/${provider.user_id}/day-availability`, {
          params: {
              year: selectedDate.getFullYear(),
              month: selectedDate.getMonth() + 1,
              day: selectedDate.getDate(),
          }
      }).then(response => {
          setAvailability(response.data);
      })
    }
  }, [selectedDate, provider])

  useEffect(() => {
    api
      .get<Appointment[]>(`providers/get/${id}`)
      .then(({ data }:any) => {
        setProvider(data);
      });
  }, [selectedDate, id]);

  const selectedDateAsText = useMemo(() => {
    return format(selectedDate, "'Dia' dd 'de' MMMM", {
      locale: ptBr,
    });
  }, [selectedDate]);

  const selectedWeekDay = useMemo(() => {
    return format(selectedDate, 'cccc', {
      locale: ptBr,
    });
  }, [selectedDate]);

  const morningAvailability = useMemo(() => {
      const times = availability
          .filter(({ hour }) => hour < 12)
          .map(({ hour, available }) => ({
              hour,
              hourFormatted: format(new Date().setHours(hour), 'HH:00'),
              available,
          }));
      return times;
  }, [availability]);

  const afternoonAvailability = useMemo(() => {
      return availability
          .filter(({ hour }) => hour >= 12 && hour < 18)
          .map(({ hour, available }) => ({
              hour,
              hourFormatted: format(new Date().setHours(hour), 'HH:00'),
              available,
          }));
  }, [availability]);

  const createAppointment = useCallback(async () => {
    if(selectedHour && provider) {
      try {
          const date = new Date(selectedDate);
  
          date.setHours(selectedHour);
          date.setMinutes(0);
  
          await api.post('/appointments', {
              provider_id: provider.user_id,
              date,
          });

          addToast({
            type: 'success',
            title: 'Agendamento realizado!',
            description: `Agendamento realizado com sucesso!`,
          });
  
      } catch (err) {
          console.log(err);
          addToast({
            type: 'error',
            title: 'Erro ao criar agendamento!',
            description: 'Ocorreu um erro ao realizar o agendamento, por favor tente mais tarde!',
          });
      }
    }
  }, [selectedDate, selectedHour, addToast, provider]);

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
          
          <Link to="/providers" style={{color: '#fff', textDecoration: 'none'}}>
            <FiUser />
            <strong style={{marginLeft: 10}}>Lista de Barbeiros</strong>
          </Link>

          <button type="button" onClick={signOut}>
            <FiPower />
          </button>
        </HeaderContainer>
      </Header>

      <Content>
      {format(selectedDate, 'EEEE') !== 'Sunday' && format(selectedDate, 'EEEE') !== 'Saturday' ? (
        <Schedule>
          {provider &&
            <ProviderBox>
              <div>
                <img
                  src={provider.avatar ? `https://beardio-files.s3.amazonaws.com/${provider.avatar}` : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                  alt={provider.name}
                />
                <strong>{provider.name}</strong>
              </div>
            </ProviderBox>
          }
            <p>
              {isToday(selectedDate) && <span>Hoje</span>}
              <span>{selectedDateAsText}</span>
              <span>{selectedWeekDay}</span>
            </p>
            <NexAppointment>
              <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <strong>Selecione o horário</strong>

                <h3>
                  {selectedHour && `${format(selectedDate, 'dd/MM/yyyy')} às ${selectedHour} Horas`}
                </h3>

                <ProfileButton onClick={() => createAppointment()}>
                    <p>Agendar</p>
                </ProfileButton>
              </div>

              <Section>
                  <strong>Manhã</strong>

                  <div>
                      {morningAvailability.map(({ hourFormatted, hour, available }) => {
                          return (
                              <Hour
                                  available={available}
                                  selected={selectedHour === hour ? true : false}
                                  onClick={() => {
                                    if (available === true){setSelectedHour(hour)}
                                  }}
                                  key={hourFormatted}
                              >
                                  <p>{hourFormatted}</p>
                              </Hour>
                          )
                      })}
                  </div>
              </Section>

              <Section>
                  <strong>Tarde</strong>

                  <div>
                      {afternoonAvailability.map(({ hourFormatted, hour, available }) => {
                          return (
                              <Hour
                                available={available}
                                selected={selectedHour === hour ? true : false}
                                onClick={() => {
                                  if (available === true){setSelectedHour(hour)}
                                }}
                                key={hourFormatted}
                              >
                                <p>{hourFormatted}</p>
                              </Hour>
                          )
                      })}
                  </div>
              </Section>
            </NexAppointment>

            
          </Schedule>
        ) : (
          <Schedule>
            <p>Não atendemos no final de semana.</p>
          </Schedule>
        )}

        <Calendar>
          <DayPicker
            weekdaysShort={['D', 'S', 'T', 'Q', 'Q', 'S', 'S']}
            fromMonth={new Date()}
            disabledDays={[{ daysOfWeek: [0, 6] }]}
            modifiers={{
              available: { daysOfWeek: [1, 2, 3, 4, 5] },
            }}
            selectedDays={selectedDate}
            onDayClick={handleDateChange}
            months={[
              'Janeiro',
              'Fevereiro',
              'Março',
              'Abril',
              'Maio',
              'Junho',
              'Julho',
              'Agosto',
              'Setembro',
              'Outubro',
              'Novembro',
              'Dezembro',
            ]}
          />
        </Calendar>
      </Content>
    </Container>
  );
};

export default Provider;