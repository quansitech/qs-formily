import Utils from '../utils';
import type { Storage } from './storage-type';

const serverStorage: Storage = {
  upload: async (file: File, action: string, hashId?: string) => {
    let server_url = action;

    const formData = new FormData();

    if (typeof hashId !== 'undefined' && hashId !== '') {
      let preUrl = {
        hash_id: '',
        title: '',
      };
      preUrl.hash_id = hashId;
      preUrl.title = file.name;

      const res = await fetch(Utils.normalizeUrl(action, preUrl));
      const resData = await res.json();
      if (resData.status) {
        return resData;
      }
      server_url = resData.server_url;
    }

    formData.append('file', file);

    // // 创建一个新的AbortController实例用来取消请求
    // const controller = new AbortController();
    // const signal = controller.signal; // 取得控制信号

    // // 使用XHR来监听进度事件
    // const xhr = new XMLHttpRequest();

    // xhr.open('POST', server_url);

    // // 处理准备状态变化事件，当readyState为`DONE`时完成上传
    // xhr.onreadystatechange = async () => {
    //     if (xhr.readyState === XMLHttpRequest.DONE) {
    //         const response = JSON.parse(xhr.responseText);
    //         return response;
    //     }
    // };

    // // 监听上传进度事件
    // xhr.upload.onprogress = (event) => {
    //     if (event.lengthComputable) {
    //         const progress = (event.loaded / event.total) * 100;
    //         console.log(progress); // 执行回调函数更新进度
    //     }
    // };

    // // 允许取消请求（如果需要）
    // xhr.onerror = () => controller.abort();

    // xhr.send(formData); // 发送包含文件的表单数据

    // // 监听signal取消事件
    // signal.addEventListener('abort', () => {
    //     xhr.abort();
    // });

    // // 等待XHR请求终止并处理JSON响应
    // try {
    //     await new Promise((resolve, reject) => {
    //         xhr.onload = resolve;
    //         xhr.onerror = reject;
    //     });
    //     return JSON.parse(xhr.response);
    // } catch (error) {
    //     return { error: 'Upload failed or was canceled.' };
    // }

    const response = await fetch(server_url, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    return data;
  },
};

export default serverStorage;
