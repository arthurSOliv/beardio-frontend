import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { isToday, format, parseISO, isAfter } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';
import DayPicker, { DayModifiers } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import { FiPower, FiClock, FiDelete, FiCheck, FiUser } from 'react-icons/fi';

import { useToast } from '../../../hooks/toast';

import { Link } from 'react-router-dom';
import {
  Container,
  Header,
  HeaderContainer,
  Profile,
  Content,
  Schedule,
  NexAppointment,
  Section,
  Appointment,
  Calendar,
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

const ClientDashboard: React.FC = () => {
  const { signOut, user } = useAuth();

  const { addToast } = useToast();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const handleDateChange = useCallback((day: Date, modifiers: DayModifiers) => {
    if (modifiers.available && !modifiers.disabled) setSelectedDate(day);
  }, []);

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month);
  }, []);

  const changeStatus = useCallback(async (appointment_id: string) => {
    const formData = {
      appointment_id,
    };

    try {
      await api.put('/appointments', formData);

      addToast({
        type: 'success',
        title: 'Agendamento atualizado!',
        description:
          'Suas informações foram atualizadas com sucesso.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Erro na atualização!',
        description:
          'Não foi possível atualizar as informações, por favor tente novamente.',
      });
    }
  }, [addToast]);

  const deleteAppointment = useCallback(async (appointment_id: string) => {
    const config = {
      data: {
        appointment_id
      }
    }

    try {
      const findAppointmentIndex = appointments.findIndex(appointment => appointment.id === appointment_id);

      const newAppointments = appointments.splice(findAppointmentIndex, 1);
      await api.delete('/appointments', config);

      setAppointments(newAppointments);

      addToast({
        type: 'success',
        title: 'Agendamento cancelado!',
        description:
          'Suas informações foram atualizadas com sucesso.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Erro no cancelamento!',
        description:
          'Não foi possível atualizar as informações, por favor tente novamente.',
      });
    }
  }, [addToast]);

  useEffect(() => {
    api
      .get<Appointment[]>('providers/me', {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      })
      .then(({ data }) => {
        const appointmentsFormatted = data.map(appointment => {
          return {
            ...appointment,
            hourFormatted: format(parseISO(appointment.date), 'HH:mm'),
          };
        });
        setAppointments(appointmentsFormatted);
      });
  }, [selectedDate]);

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

  const morningAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      return parseISO(appointment.date).getHours() < 12;
    });
  }, [appointments]);

  const afternoonAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      return parseISO(appointment.date).getHours() >= 12;
    });
  }, [appointments]);

  const nextAppointment = useMemo(() => {
    return appointments.find(appointment => {
      return isAfter(parseISO(appointment.date), new Date());
    });
  }, [appointments]);

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
      <Schedule>
          <h1>Horários agendados</h1>
          <p>
            {isToday(selectedDate) && <span>Hoje</span>}
            <span>{selectedDateAsText}</span>
            <span>{selectedWeekDay}</span>
          </p>

          {isToday(selectedDate) && nextAppointment && (
            <NexAppointment>
              <strong>Agendamento a seguir</strong>
              <div>
                <img
                  src={nextAppointment.client.avatar ? `https://beardio-files.s3.amazonaws.com/${nextAppointment.client.avatar}` : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                  alt={nextAppointment.client.name}
                />
                <strong>{nextAppointment.client.name}</strong>
                <span>
                  <FiClock />
                  {nextAppointment.hourFormatted}
                </span>
              </div>
            </NexAppointment>
          )}

          <Section>
            <strong>Manhã</strong>

            {morningAppointments.length === 0 && (
              <p>Nenhum agendamento neste período</p>
            )}

            {morningAppointments.map(appointment => (
              <Appointment key={appointment.id}>
                <span>
                  <FiClock />
                  {appointment.hourFormatted}
                </span>

                <div>
                  <div>
                    <img
                      src={appointment.client.avatar ? `https://beardio-files.s3.amazonaws.com/${appointment.client.avatar}` : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                      alt={appointment.client.name}
                    />
                    <strong>{appointment.client.name}</strong>
                  </div>

                  {!appointment.status ? (
                    <>
                      <a type="button" style={{cursor: 'pointer'}} onClick={() => deleteAppointment(appointment.id)}>
                        <FiDelete style={{color: 'red', fontSize: 30, marginRight: 30}} />
                      </a>
                      <a type="button" style={{cursor: 'pointer'}} onClick={() => changeStatus(appointment.id)}>
                        <FiCheck style={{color: '#40FF30', fontSize: 30}} />
                      </a>
                    </>
                  )
                  : (
                      <p>Finalizado</p>
                  )}
                </div>
              </Appointment>
            ))}
          </Section>

          <Section>
            <strong>Tarde</strong>

            {afternoonAppointments.length === 0 && (
              <p>Nenhum agendamento neste período</p>
            )}

            {afternoonAppointments.map(appointment => (
              <Appointment key={appointment.id}>
                <span>
                  <FiClock />
                  {appointment.hourFormatted}
                </span>

                <div>
                  <div>
                    <img
                      src={appointment.client.avatar ? `https://beardio-files.s3.amazonaws.com/${appointment.client.avatar}` : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                      alt={appointment.client.name}
                    />
                    <strong>{appointment.client.name}</strong>
                  </div>

                  {!appointment.status ? (
                    <>
                      <a type="button" style={{cursor: 'pointer'}} onClick={() => deleteAppointment(appointment.id)}>
                        <FiDelete style={{color: 'red', fontSize: 30, marginRight: 30}} />
                      </a>
                      <a type="button" style={{cursor: 'pointer'}} onClick={() => changeStatus(appointment.id)}>
                        <FiCheck style={{color: '#40FF30', fontSize: 30}} />
                      </a>
                    </>
                  )
                  : (
                      <p>Finalizado</p>
                  )}
                </div>
              </Appointment>
            ))}
          </Section>
        </Schedule>

        <Calendar>
          <DayPicker
            weekdaysShort={['D', 'S', 'T', 'Q', 'Q', 'S', 'S']}
            fromMonth={new Date()}
            disabledDays={[{ daysOfWeek: [0, 6] }]}
            modifiers={{
              available: { daysOfWeek: [1, 2, 3, 4, 5] },
            }}
            onMonthChange={handleMonthChange}
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

export default ClientDashboard;