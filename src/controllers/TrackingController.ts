import moment from 'moment';
import connection from '../database/connection';
import api from '../services/api';

interface TrackingCode {
  Rastreio: string;
}

interface TrackingResult {
  Rastreio: string;
  DataPostagem: string | null;
  DataAtualizacao: string | null;
  Status: string;
  EnderecoCompleto: string;
  Latitude: string | null;
  Longitude: string | null;
  DataConsultaApi: string;
}

export default {
  async getCodes() {
    return await connection('loggi_rastreio')
      .select('Rastreio')
      .where(function () {
        this.whereNull('Status').orWhereNotIn('Status', ['Entregue']);
      });
  },

  async searchTracking(trackingCodes: TrackingCode[]) {
    return await Promise.all(
      trackingCodes.map(async (code) => {
        try {
          const { data } = await api.get(code.Rastreio);

          return {
            Rastreio: code.Rastreio,
            DataPostagem: moment
              .unix(data.history[0].status.updated_at)
              .format('YYYY-MM-DD'),
            DataAtualizacao: moment
              .unix(data.history[data.history.length - 1].status.updated_at)
              .format('YYYY-MM-DD'),
            Status: data.status.message,
            EnderecoCompleto: data.destination.address,
            Latitude: data.destination.pos.lat,
            Longitude: data.destination.pos.lng,
            DataConsultaApi: moment().format('YYYY-MM-DD H:mm:ss'),
          };
        } catch (error) {
          return {
            Rastreio: code.Rastreio,
            DataPostagem: null,
            DataAtualizacao: null,
            Status: 'Não localizado',
            EnderecoCompleto: '',
            Latitude: null,
            Longitude: null,
            DataConsultaApi: moment().format('YYYY-MM-DD H:mm:ss'),
          };
        }
      })
    );
  },

  async saveTracking(trackingResult: TrackingResult[]) {
    return await Promise.all(
      trackingResult.map(async (tracking) => {
        try {
          await connection('loggi_rastreio')
            .where('Rastreio', tracking.Rastreio)
            .update({
              DataPostagem: tracking.DataPostagem,
              DataAtualizacao: tracking.DataAtualizacao,
              Status: tracking.Status,
              EnderecoCompleto: tracking.EnderecoCompleto,
              Latitude: tracking.Latitude,
              Longitude: tracking.Longitude,
              DataConsultaApi: tracking.DataConsultaApi,
            });

          return { tracking: tracking.Rastreio, status: 'success' };
        } catch (error) {
          console.log(`Rastreio sendo reprocessado: ${tracking.Rastreio}`);

          await this.saveTracking([tracking]);

          return { tracking: tracking.Rastreio, status: 'error' };
        }
      })
    );
  },
};
