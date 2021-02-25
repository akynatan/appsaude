import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Feather';

import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

import userImg from '../../assets/user.png';

import {
  Container,
  Header,
  HeaderTitle,
  Username,
  ProfileButton,
  UserAvatar,
  ProvidersList,
  ProvidersListTitle,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  ProviderInfo,
  ProviderMeta,
  ProviderMetaText,
} from './styles';

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

const Dashboard: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const navigation = useNavigation();
  const { navigate } = navigation;

  const { user } = useAuth();
  const { name, avatar_url } = user;

  const navigateToProfile = useCallback(() => {
    navigate('Profile');
  }, [navigate]);

  const navigateToCreateAppointment = useCallback(
    (provider_id: string) => {
      navigate('CreateAppointment', { providerId: provider_id });
    },
    [navigate],
  );

  useEffect(() => {
    api.get('providers').then(response => {
      setProviders(response.data);
    });
  }, []);

  return (
    <Container>
      <Header>
        <HeaderTitle>
          Bem vindo,
          {'\n'}
          <Username>{name}</Username>
        </HeaderTitle>

        <ProfileButton onPress={navigateToProfile}>
          <UserAvatar source={{ uri: avatar_url }} />
        </ProfileButton>
      </Header>

      <ProvidersList
        data={providers}
        keyExtractor={provider => provider.id}
        ListHeaderComponent={
          <ProvidersListTitle>Cabeleireiros</ProvidersListTitle>
        }
        renderItem={({ item: provider }) => {
          return (
            <ProviderContainer
              onPress={() => {
                navigateToCreateAppointment(provider.id);
              }}
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

              <ProviderInfo>
                <ProviderName>{provider.name}</ProviderName>
                <ProviderMeta>
                  <Icon name="calendar" size={14} color="#ff9000" />
                  <ProviderMetaText>Segunda à sexta</ProviderMetaText>
                </ProviderMeta>

                <ProviderMeta>
                  <Icon name="clock" size={14} color="#ff9000" />
                  <ProviderMetaText>8h ás 18h</ProviderMetaText>
                </ProviderMeta>
              </ProviderInfo>
            </ProviderContainer>
          );
        }}
      >
        as
      </ProvidersList>
    </Container>
  );
};

export default Dashboard;
