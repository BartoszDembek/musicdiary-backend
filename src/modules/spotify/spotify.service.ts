import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SpotifyService {
  private readonly logger = new Logger(SpotifyService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;


  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('CLIENT_SECRET') || '';
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
    const offset = Math.floor(Math.random() * 5)
    const url = `https://api.spotify.com/v1/browse/new-releases?offset=${offset}`
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
    const url = `https://api.spotify.com/v1/artists/${id}/top-tracks`
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

  async search(query: string) {
    const token = await this.getToken();
    const url = `https://api.spotify.com/v1/search?q=${query}&type=album,artist,track`
    const headers = await this.getAuthToken(token)
    try {
      const response = await axios.get(
        url,
        { headers }
      )
      return response.data
    } catch(error){
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get search results: ${error.response?.data || error.message}`);
      }
      throw new Error(`Failed to get search results: ${error.message}`);
    }
  }

  async getTrackByID(id: string) {
    const token = await this.getToken();
    const url = `https://api.spotify.com/v1/tracks/${id}`
    const headers = await this.getAuthToken(token)
    try {
      const response = await axios.get(
        url,
        { headers }
      )
      return response.data
    } catch(error){
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get track by ID: ${error.response?.data || error.message}`);
      }
      throw new Error(`Failed to get track by ID: ${error.message}`);
    }
  }
} 