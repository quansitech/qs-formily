import React from 'react'
import {UploadProps as FormilyUploadProps, Upload as FormilyUpload} from "@formily/antd"
import { Modal } from 'antd';
import cosStorage from './storage/cos';
import ossStorage from './storage/oss';
import serverStorage from './storage/server';
import tosStorage from './storage/tos';
import init, { calc_file_hash } from '@quansitech/file-md5-wasm';

export interface UploadProps extends FormilyUploadProps {
  hashCheck?: boolean, //是否校验hash
  uploadTo?: 'cos' | 'oss' | 'tos' | 'server', //上传到哪里
  action: string
}

export interface StorageProps {
  file: File,
  action: string,
  hashId?: string
}

export const Upload: React.FC<React.PropsWithChildren<UploadProps>> = (props: React.PropsWithChildren<UploadProps>) => {
  const [ previewImage, setPreviewImage ] = React.useState('');
  const [ previewOpen, setPreviewOpen ] = React.useState(false);

  React.useEffect(() => {
    init();
  }, []);

  const {
    hashCheck = true,
    uploadTo = 'server',
    listType = 'picture-card',
    ...restProps
  } = props;

  const factoryStorage = (uploadTo: string) => {
    if (uploadTo === 'cos') {
      return cosStorage;
    }
    if (uploadTo === 'oss') {
      return ossStorage;
    }
    if (uploadTo === 'tos') {
      return tosStorage;
    }
    if (uploadTo === 'server') {
      return serverStorage;
    }
  };

  const uploadFn = async (file: File) => {
    const params: StorageProps = {
        file,
        action: restProps.action,
        hashId: ''
    };
    if (hashCheck) {
        params.hashId = await calc_file_hash(file);
    }

    const storage = await factoryStorage(uploadTo);

    const res = await storage.upload(params.file, params.action, params.hashId);

    return res;

  }


 const handleChange = (param) => {

   const parser = new DOMParser();

    if(restProps.onChange){
      restProps.onChange(param.map(file => {
        const doc = parser.parseFromString(file.response, "application/xml");
        const error = doc.querySelector('Error > Message')?.textContent;
        if(error || file.status !== 'done'){
          return {
            ...file,
            status: error ? 'error' : file.status,
            response: error ? {errorMessage: error} : file.response
          }
        }
        else{
          return {
            status: file.status,
            name: file.name,
            file_id: file.response?.file_id,
            file_url: file.response?.file_url,
            url: file.url
          }
        }
        
      }));
    }
 }

 const handlePreivew = (file) => {
    if(file.url){
      setPreviewImage(file.url);
      setPreviewOpen(true);
    }
 }

  const formilyProps = {
    ...restProps,
    ...{
      listType,
      customRequest: (callbackProps:any) => {
        uploadFn(callbackProps.file).then((res) => {
            callbackProps.onSuccess(res);
        });
      },
      onChange: handleChange,
      onPreview: handlePreivew,
      showUploadList: {
        showDownloadIcon: true,
        showRemoveIcon: true,
        showPreviewIcon: true
      }
    }
  }

  return <>
    <FormilyUpload {...formilyProps} ></FormilyUpload>
    <Modal visible={previewOpen} footer={null} onCancel={() =>  setPreviewOpen(false)}>
      <img
        style={{
          width: '100%',
          marginTop: '20px'
        }}
        src={previewImage}
      />
    </Modal>
  </>
}


