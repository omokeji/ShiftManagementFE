import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobType } from './job-types.entity';
import axios from 'axios';

@Injectable()
export class JobTypesService {
  constructor(@InjectRepository(JobType) private jobTypesRepository: Repository<JobType>) {}

  // async create(title: string, description: string, location: { address: string; radius: number }) {
  //   const jobType = this.jobTypesRepository.create({ title, description, location });
  //   return this.jobTypesRepository.save(jobType);
  // }

  
  async create(title: string, description: string, phone: string, email: string, locationInput: { address?: string; lat?: number; lon?: number; radius: number }) {
    let location: { lat?: number; lon?: number; radius: number; address?: string };
    if (locationInput.address) {
      // Use Google Maps Geocoding API (replace with your API key)
      // console.log('Google Maps API key:', process.env.GOOGLE_MAPS_API_KEY); // Log the API key for debugging  
      // console.log(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationInput.address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`)
      // const response = await axios.get(
      //   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationInput.address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      // );

      // console.log('Google Maps API response:', response.data); // Log the response for debugging
      // const { lat, lng } = response.data.results[0].geometry.location;
      location = { lat : locationInput.lat, lon: locationInput.lon, radius: locationInput.radius, address: locationInput.address };
    } else if (locationInput.lat && locationInput.lon) {
      location = { lat: locationInput.lat, lon: locationInput.lon, radius: locationInput.radius };
    } else {
      throw new BadRequestException('Location must provide address or lat/lon');
    }

    const colorcode = this.getRandomColor();
    const code = "";
    const jobType = this.jobTypesRepository.create({ 
      title, 
      description,
      phone,
      email,
      colorcode,
      code,
      location });
    return this.jobTypesRepository.save(jobType);
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  async findAll(): Promise<JobType[]> {
    return this.jobTypesRepository.find();
  }

  // async create(title: string, description: string, location: { lat: number; lon: number; radius: number }) {
  //   const jobType = this.jobTypesRepository.create({ title, description, location });
  //   return this.jobTypesRepository.save(jobType);
  // }
}