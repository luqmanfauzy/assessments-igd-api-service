import { determineTriage } from '../app/helpers/Triage.helper.js';

async function testPreview() {
  const mockData = {
    doa: false,
    respiratory_rate: 20,
    oxygen_saturation: 98,
    heart_rate: 80,
    systolic_blood_pressure: 120,
    pain_scale: 2,
    temperature: 36.5
  };
  
  const result = await determineTriage(mockData, []);
  console.log('Test Result (Normal Vitals):', result);

  const emergencyData = {
    ...mockData,
    respiratory_rate: 40, // Should be RED
  };
  const emergencyResult = await determineTriage(emergencyData, []);
  console.log('Test Result (High RR - RED):', emergencyResult);
}

testPreview().catch(console.error);
