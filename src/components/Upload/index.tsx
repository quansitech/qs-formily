import React from 'react'
import {UploadProps as FormilyUploadProps, Upload as FormilyUpload} from "@formily/antd"

export interface UploadProps extends FormilyUploadProps {
  oss?: boolean //是否oss上传
}

export const Upload: React.FC<React.PropsWithChildren<UploadProps>> = (props: React.PropsWithChildren<UploadProps>) => {
  const [ossData, setOssData] = React.useState({
    host: '',
    dir: '',
    accessid: '',
    policy: '',
    signature: '',
    callback: '',
    callback_var: '',
    oss_meta: ''
  })
  const [fileList, setFileList] = React.useState([]);

  const {
    oss,
    ...restProps
  } = props;

  const getPolicy = async (title) => {
    return await fetch(`${restProps.action}?title=${encodeURIComponent(title)}`);
  }

  const getExtraData = file => {
    const extra = {
      key: file.key,
      OSSAccessKeyId: ossData.accessid,
      policy: ossData.policy,
      Signature: ossData.signature,
      success_action_status: 200,
      callback: ossData.callback
    };

    const var_obj = JSON.parse(ossData.callback_var);
    for (let key in var_obj) {
      extra[key] = var_obj[key];
    }
    if (ossData.oss_meta) {
      const meta_obj = JSON.parse(ossData.oss_meta);
      for (let meta in meta_obj) {
        extra[meta] = meta_obj[meta];
      }
    }

    return extra;
  };


  const beforeUpload = async file => {
    if(oss){
      const res = await getPolicy(file.name);
      const data = await res.json();
      setOssData(data);

      const suffix = file.name.slice(file.name.lastIndexOf('.'));
      file.url = data.host + '/' + data.dir + suffix;
      file.key = data.dir + suffix;
    }

    return file;
 }

 const handleChange = (param) => {

   const parser = new DOMParser();

    if(restProps.onChange){
      restProps.onChange(param.map(file => {
        const doc = parser.parseFromString(file.response, "application/xml");
        const error = doc.querySelector('Error > Message')?.textContent;
        return {
          ...file,
          status: error ? 'error' : file.status,
          response: error ? {errorMessage: error} : file.response
        }
      }));
    }
 }

  const formilyProps = {
    ...restProps,
    ...{
      action: ossData.host,
      data: getExtraData,
      beforeUpload,
      onChange: handleChange
    }
  }

  return <FormilyUpload {...formilyProps} ></FormilyUpload>
}


