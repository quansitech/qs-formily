import Utils from '../utils';
import type { Storage } from './storage-type';

const cosStorage: Storage = {
  upload: async (file: File, action: string, hashId?: string) => {
    const formData = new FormData();

    let preUrl = {
      hashId: '',
      vendor_type: '',
      file_type: '',
      title: '',
    };

    if (typeof hashId !== 'undefined' && hashId !== '') {
      preUrl.hashId = hashId;
    }

    let fileType = file.type;
    if (!fileType) {
      fileType = await Utils.getFileType.start(file);
    }
    preUrl.vendor_type = 'tengxun_cos';
    preUrl.file_type = fileType;
    preUrl.title = file.name;

    const res = await fetch(Utils.normalizeUrl(action, preUrl));
    const resData = await res.json();
    if (parseInt(resData.status) === 2) {
      return {
        file_id: resData.file_id,
        url: resData.file_url,
      };
    }

    const new_multipart_params = {
      'Content-type': fileType,
      ...resData.params,
    };

    for (let key in new_multipart_params) {
      if (new_multipart_params.hasOwnProperty(key)) {
        formData.append(key, new_multipart_params[key]);
      }
    }

    formData.append('file', file);

    const response = await fetch(resData['url'], {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    return data;
  },
};

export default cosStorage;
