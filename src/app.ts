import moment from 'moment';

import TrackingController from './controllers/TrackingController';

const app = async () => {
  const dataInicioProcesso = moment().format('DD/MM/YYYY H:mm:ss');

  console.log(`Searching codes in the database...`);
  const codes = await TrackingController.getCodes();

  console.log(`Total records found: ${codes.length}`);

  console.log(`Consulting tracking at Loggi...`);
  const trackingResult = await TrackingController.searchTracking(codes);

  console.log(`Saving data to the database...`);
  await TrackingController.saveTracking(trackingResult);

  const dataFimProcesso = moment().format('DD/MM/YYYY H:mm:ss');

  console.log(`Completed process: ${dataInicioProcesso} - ${dataFimProcesso}`);

  process.exit();
};

export default app;
