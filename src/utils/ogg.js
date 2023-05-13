import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';
import fs, { createWriteStream } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { removeFile } from './remove-files.js';

const __dirname = dirname(fileURLToPath(import.meta.url));


class OggConverter {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path)
  }

  toMp3(inputPath, userId) {
    try {
      const outputPath = resolve(dirname(inputPath), `${userId}.mp3`);

      return new Promise((res, rej) => {
        ffmpeg(inputPath)
          .inputOption('-t 30')
          .output(outputPath)
          .on('end', () => {
            removeFile(inputPath);
            res(outputPath);
          })
          .on('error', (err) => rej(err.message))
          .run()
      })
    }
    catch (e) {
      console.log('Error in OggConverter.toMp3: ', e.message);
    }
  }

  async create(url, filename) {
    try {
      const oggPath = resolve(__dirname, '../../__temp/voices', `${filename}.ogg`);

      const response = await axios({
        method: 'get',
        url,
        responseType: 'stream'
      });

      
      return new Promise(async (res, rej) => {
        const stream = createWriteStream(oggPath);
        response.data.pipe(stream);

        stream.on('error', (err) => {
          stream.close();
          rej(`Reject OggConverter.create ${err}`)
        });
        stream.on('finish', () => res(oggPath));
      })
    }
    catch (e) {
      console.log('Error in OggConverter.create: ', e.message);
    }
  }
}

export const ogg = new OggConverter();
