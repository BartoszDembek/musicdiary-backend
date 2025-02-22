import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SpotifyService {
  private readonly logger = new Logger(SpotifyService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;


  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('CLIENT_ID') || '10b3d5e0f62844009e802c9932bf89ce';
    this.clientSecret = this.configService.get<string>('CLIENT_SECRET') || '9a040a768ca146119d0563d9879dcffb';
  }

  async getToken() {
    if (!this.clientId || !this.clientSecret) {
        throw new Error('Spotify credentials not configured');
    }

    const authString = `${this.clientId}:${this.clientSecret}`;
    const authBase64 = Buffer.from(authString).toString('base64'); 

    const url = 'https://accounts.spotify.com/api/token';
    const headers = {
      'Authorization': `Basic ${authBase64}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');

    try {
      const response = await axios.post(
        url,
        new URLSearchParams({ grant_type: 'client_credentials' }),
        { headers }
      );
      return response.data.access_token;
    } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(`Failed to get Spotify token: ${error.response?.data || error.message}`);
        }
        throw new Error(`Failed to get Spotify token: ${error.message}`);
    }
  }

  async getAuthToken(token:string): Promise<any> {
    return {'Authorization':'Bearer ' + token}
  }

  async getNewReleases() {
    const token = await this.getToken();
    const url = "https://api.spotify.com/v1/browse/new-releases"
    const headers = await this.getAuthToken(token)
    try {
      const response = await axios.get(
        url,
        { headers }
      )
      return response.data
    } catch(error){
       if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get new releases: ${error.response?.data || error.message}`);
      }
      throw new Error(`Failed to get new releases: ${error.message}`);
    }
  }

  async getAlbumByID(id: string) {
    const token = await this.getToken();
    const url = `https://api.spotify.com/v1/albums/${id}`
    const headers = await this.getAuthToken(token)
    try {
      const response = await axios.get(
        url,
        { headers }
      )
      return response.data
    } catch(error){
       if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get album by ID: ${error.response?.data || error.message}`);
      }
      throw new Error(`Failed to get album by ID: ${error.message}`);
    }
  }

  async getArtistByID(id: string) {
    const token = await this.getToken();
    const url = `https://api.spotify.com/v1/artists/${id}`
    const headers = await this.getAuthToken(token)
    try {
      const response = await axios.get(
        url,
        { headers }
      )
      return response.data
    } catch(error){
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get artist by ID: ${error.response?.data || error.message}`);
      }
      throw new Error(`Failed to get artist by ID: ${error.message}`);
    }
  }

  async getArtistAlbums(id: string) {
    const token = await this.getToken();
    const url = `https://api.spotify.com/v1/artists/${id}/albums`
    const headers = await this.getAuthToken(token)
    try {
      const response = await axios.get(
        url,
        { headers }
      )
      return response.data
    } catch(error){
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get artist albums: ${error.response?.data || error.message}`);
      }
      throw new Error(`Failed to get artist albums: ${error.message}`);
    }
  }

  async getArtistTopTracks(id: string) {
    const token = await this.getToken();
    const url = `https://api.spotify.com/v1/artists/${id}/top-tracks?market=US`
    const headers = await this.getAuthToken(token)
    try {
      const response = await axios.get(
        url,
        { headers }
      )
      return response.data
    } catch(error){
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get artist top tracks: ${error.response?.data || error.message}`);
      }
      throw new Error(`Failed to get artist top tracks: ${error.message}`);
    }
  }

  async getRelatedArtists(id: string) {
    const token = await this.getToken();
    const url = `https://api.spotify.com/v1/artists/${id}/related-artists`
    const headers = await this.getAuthToken(token)
    try {
      const response = await axios.get(
        url,
        { headers }
      )
      return response.data
    } catch(error){
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get related artists: ${error.response?.data || error.message}`);
      }
      throw new Error(`Failed to get related artists: ${error.message}`);
    }
  }
} 