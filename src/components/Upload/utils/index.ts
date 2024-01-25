const Util = {
  getFileType: {
    fileToArrayBuffer: async function (file: any, callback: any) {
      const reader = new FileReader();
      reader.onload = function (evt: any) {
        if (typeof callback === 'function') {
          return callback(evt.target.result);
        }
      };
      reader.readAsArrayBuffer(file);
    },
    getFileTypeViaHeader: function f(e: any) {
      const bufferInt = new Uint8Array(e);

      const arr = bufferInt.slice(0, 4); // 通用格式图片
      const headerArr = bufferInt.slice(0, 16); // heic格式图片
      let header = '';
      let allHeader = '';
      let realMimeType;

      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16); // 转成16进制的buffer
      }

      for (let i = 0; i < headerArr.length; i++) {
        allHeader += headerArr[i].toString(16);
      }
      // magic numbers: http://www.garykessler.net/library/file_sigs.html
      // console.log(header.indexOf('000'),allHeader.lastIndexOf('000'))
      switch (header) {
        case '89504e47':
          realMimeType = 'image/png';
          break;
        case '47494638':
          realMimeType = 'image/gif';
          break;
        case 'ffd8ffDB':
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          realMimeType = 'image/jpeg';
          break;
        case '00020': // heic开头前4位可能是00020也可能是00018，其实这里应该是判断头尾000的，可以自己改下
        case '00018':
        case '00024':
        case '0001c':
          realMimeType =
            allHeader?.lastIndexOf('000') === 22 ? 'image/heic' : 'unknown';
          break;
        default:
          realMimeType = 'unknown';
          break;
      }
      return realMimeType;
    },
    start: async function (file: any) {
      const p = new Promise<string>((resolve) => {
        this.fileToArrayBuffer(file, (res: any) => {
          const type = this.getFileTypeViaHeader(res);
          resolve(type);
        });
      });

      return p;
    },
  },
  getSuffix: (filename: string) => {
    let pos = filename.lastIndexOf('.');
    let suffix = '';
    if (pos !== -1) {
      suffix = filename.substring(pos);
    }
    return suffix;
  },
  normalizeUrl: (url: string, params: any) => {
    const urlObj = new URL(url, window.location.origin);

    let searchParams = new URLSearchParams(urlObj.search);

    Object.keys(params).forEach((key) => {
      searchParams.set(key, params[key]);
    });

    urlObj.search = searchParams.toString();

    return urlObj.toString();
  },
};

export default Util;
