import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, Alert } from 'react-native';
import { format } from 'date-fns';

import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

import userImg from '../../assets/user.png';

import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  UserAvatar,
  Content,
  ProvidersListContainer,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Calendar,
  Title,
  OpenDayPickerButton,
  OpenDayPickerButtonText,
  Schedule,
  Section,
  SectionTitle,
  SectionContent,
  Hour,
  HourText,
  CreateAppointmentButton,
  CreateAppointmentButtonText,
} from './styles';

interface RouteParams {
  providerId: string;
}

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

export interface hourAvailabilityInDay {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const { user } = useAuth();
  const { avatar_url } = user;

  const { goBack, navigate } = useNavigation();

  const route = useRoute();
  const { providerId } = route.params as RouteParams;

  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(providerId);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(0);
  const [hoursAvailabilityInDay, setHoursAvailabilityInDay] = useState<
    hourAvailabilityInDay[]
  >([]);

  const navigateToBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleSelectProvider = useCallback((providerIdSelected: string) => {
    setSelectedProvider(providerIdSelected);
  }, []);

  const handleToggleDayPicker = useCallback(() => {
    setShowDatePicker(state => !state);
  }, []);

  const handleDateChange = useCallback(
    (event: any, date: Date | undefined) => {
      if (Platform.OS === 'android') {
        handleToggleDayPicker();
      }

      if (date) {
        setSelectedDate(date);
      }
    },
    [handleToggleDayPicker],
  );

  const handleSelectHour = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, []);

  const handleCreateAppointment = useCallback(async () => {
    try {
      const date = new Date(selectedDate);
      date.setHours(selectedHour);
      date.setMinutes(0);

      await api.post('appointments', { provider_id: selectedProvider, date });

      navigate('AppointmentCreated', { date: date.getTime() });
    } catch (err) {
      Alert.alert(
        'Erro ao criar agendamento',
        'Ocorreu um erro ao tentar criar o agendamento. Tente novamente!',
      );
    }
  }, [navigate, selectedDate, selectedProvider, selectedHour]);

  const morningAvailability = useMemo(() => {
    return hoursAvailabilityInDay
      .filter(hourAvailability => hourAvailability.hour < 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        };
      });
  }, [hoursAvailabilityInDay]);

  const afterNoonAvailability = useMemo(() => {
    return hoursAvailabilityInDay
      .filter(hourAvailability => hourAvailability.hour >= 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        };
      });
  }, [hoursAvailabilityInDay]);

  useEffect(() => {
    api.get('providers').then(response => {
      setProviders(response.data);
    });
  }, []);

  useEffect(() => {
    api
      .get(`providers/${selectedProvider}/day-availability`, {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      })
      .then(response => {
        setHoursAvailabilityInDay(response.data);
      });
  }, [selectedDate, selectedProvider]);

  return (
    <Container>
      <Header>
        <BackButton onPress={navigateToBack}>
          <Icon name="chevron-left" size={24} color="#959991" />
        </BackButton>

        <HeaderTitle>Cabeleireiros</HeaderTitle>
        <UserAvatar
          source={
            avatar_url
              ? {
                  uri: avatar_url,
                }
              : userImg
          }
        />
      </Header>
      <Content>
        <ProvidersListContainer>
          <ProvidersList
            data={providers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={provider => provider.id}
            renderItem={({ item: provider }) => {
              return (
                <ProviderContainer
                  onPress={() => {
                    handleSelectProvider(provider.id);
                  }}
                  selected={provider.id === selectedProvider}
                >
                  <ProviderAvatar
                    source={
                      provider.avatar_url
                        ? {
                            uri: provider.avatar_url,
                          }
                        : userImg
                    }
                  />
                  <ProviderName selected={provider.id === selectedProvider}>
                    {provider.name}
                  </ProviderName>
                </ProviderContainer>
              );
            }}
          />
        </ProvidersListContainer>
        <Calendar>
          <Title>Escolha a data</Title>

          <OpenDayPickerButton onPress={handleToggleDayPicker}>
            <OpenDayPickerButtonText>
              Selecionar outra data
            </OpenDayPickerButtonText>
          </OpenDayPickerButton>
          {showDatePicker && (
            <DateTimePicker
              {...(Platform.OS === 'ios' && { textColor: '#f4ede8' })}
              display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
              mode="date"
              value={selectedDate}
              onChange={handleDateChange}
            />
          )}
        </Calendar>

        <Schedule>
          <Title>Escolha o horário</Title>
          <Section>
            <SectionTitle>Manhã</SectionTitle>

            <SectionContent>
              {morningAvailability.map(({ hourFormatted, hour, available }) => (
                <Hour
                  enabled={available}
                  selected={selectedHour === hour}
                  key={hourFormatted}
                  available={available}
                  onPress={() => {
                    handleSelectHour(hour);
                  }}
                >
                  <HourText selected={selectedHour === hour}>
                    {hourFormatted}
                  </HourText>
                </Hour>
              ))}
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Tarde</SectionTitle>

            <SectionContent>
              {afterNoonAvailability.map(
                ({ hourFormatted, hour, available }) => (
                  <Hour
                    enabled={available}
                    selected={selectedHour === hour}
                    key={hourFormatted}
                    available={available}
                    onPress={() => {
                      handleSelectHour(hour);
                    }}
                  >
                    <HourText selected={selectedHour === hour}>
                      {hourFormatted}
                    </HourText>
                  </Hour>
                ),
              )}
            </SectionContent>
          </Section>
        </Schedule>

        <CreateAppointmentButton onPress={handleCreateAppointment}>
          <CreateAppointmentButtonText>Agendar</CreateAppointmentButtonText>
        </CreateAppointmentButton>
      </Content>
    </Container>
  );
};

export default CreateAppointment;
