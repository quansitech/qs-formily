import React from 'react'
import { Button, Modal, Upload as AntdUpload } from 'antd'
import type { UploadFile, UploadProps as AntdUploadProps } from 'antd/lib/upload/interface';
import { useField } from '@formily/react'

//antd的Button类型依赖@types/react，本项目未安装时JSX无法推断，这里统一转成组件类型使用
const UploadTrigger = Button as unknown as React.ComponentType<{ children?: React.ReactNode }>;

const HEIC_MIME_TYPES = [
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
];
const HEIC_ACCEPT_ITEMS = ['image/heic', 'image/heif', '.heic', '.heif'];
const HEIC_EXT_RE = /\.(heic|heif)(?:$|[?#])/i;
const OSS_HEIC_PROCESS = 'x-oss-process=image/format,jpg';

export interface UploadFileLike {
  uid?: string
  type?: string
  mime_type?: string
  name?: string
  title?: string
  status?: string
  url?: string
  thumbUrl?: string
  thumb_url?: string
  previewUrl?: string
  preview_url?: string
  file_url?: string
  downloadURL?: string
  imgURL?: string
  response?: any
  [key: string]: any
}

//阿里云oss的policyGet接口返回结构
export interface OssPolicy {
  host?: string
  dir?: string
  accessid?: string
  policy?: string
  signature?: string
  callback?: string
  callback_var?: string
  oss_meta?: string
}

export interface UploadProps extends Omit<AntdUploadProps, 'value' | 'onChange' | 'fileList' | 'beforeUpload' | 'accept' | 'onPreview'> {
  value?: UploadFileLike[]
  onChange?: (value: Record<string, any>[]) => void
  beforeUpload?: AntdUploadProps['beforeUpload']
  accept?: string
  onPreview?: AntdUploadProps['onPreview']
  oss?: boolean //是否oss直传，false时文件直接post到action
  previewUrl?: (file?: UploadFileLike) => string //自定义预览地址，优先于文件自身的preview_url/thumb_url
  textContent?: React.ReactNode
}

const parseJson = (value: unknown): Record<string, any> => {
  if (typeof value !== 'string' || !value) {
    return {};
  }

  try {
    return JSON.parse(value);
  } catch (e) {
    return {};
  }
}

const addHeicAccept = (accept?: string) => {
  if (!accept) {
    return accept;
  }

  const acceptItems = accept.split(',').map(item => item.trim()).filter(Boolean);
  if (!acceptItems.some(item => /^image\/\*$/i.test(item))) {
    return accept;
  }

  HEIC_ACCEPT_ITEMS.forEach(item => {
    if (!acceptItems.some(acceptItem => acceptItem.toLowerCase() === item)) {
      acceptItems.push(item);
    }
  });

  return acceptItems.join(',');
}

const getFileExt = (filename?: string) => {
  const name = filename || '';
  const dotIndex = name.lastIndexOf('.');
  return dotIndex > -1 ? name.slice(dotIndex) : '';
}

const omitEmpty = (data: Record<string, any>) => {
  const result: Record<string, any> = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
      result[key] = data[key];
    }
  });

  return result;
}

const withQuery = (url: string, query: string) => {
  return `${url}${url.indexOf('?') > -1 ? '&' : '?'}${query}`;
}

const appendProcess = (url?: string, process?: string) => {
  if (!url || !process || url.indexOf(process) > -1) {
    return url;
  }

  return `${url}${url.indexOf('?') > -1 ? '&' : '?'}${process}`;
}

const getResponseField = (file: UploadFileLike | undefined, key: string) => {
  const response = file?.response;
  if (!response || typeof response !== 'object') {
    return undefined;
  }

  return (response as Record<string, any>)[key];
}

const getFileUrl = (file?: UploadFileLike) => {
  return file?.url
    || file?.downloadURL
    || file?.imgURL
    || file?.file_url
    || getResponseField(file, 'file_url')
    || getResponseField(file, 'url');
}

const isHeicFile = (file?: UploadFileLike) => {
  const mimeType = String(file?.type || file?.mime_type || getResponseField(file, 'mime_type') || '').toLowerCase();
  if (mimeType && HEIC_MIME_TYPES.indexOf(mimeType) > -1) {
    return true;
  }

  return [
    file?.name,
    file?.url,
    file?.file_url,
    file?.downloadURL,
    file?.imgURL,
    getResponseField(file, 'file_url'),
    getResponseField(file, 'url'),
  ].some(value => typeof value === 'string' && HEIC_EXT_RE.test(value));
}

const getState = (target?: UploadFileLike) => {
  if (!target) {
    return undefined;
  }
  if (target.success === false || target.failed === true || target.error) {
    return 'error';
  }

  const state = target.state || target.status;
  return typeof state === 'string' ? state : undefined;
}

const getResponseError = (response: any): string => {
  if (typeof response === 'string') {
    const text = response.trim();
    if (!text) {
      return '';
    }

    const doc = new DOMParser().parseFromString(text, 'application/xml');
    const message = doc.querySelector('Error > Message')?.textContent;
    if (message) {
      return message;
    }

    //非json的html/xml响应（如thinkphp异常页）按失败处理
    return text.charAt(0) === '<' ? '上传失败' : '';
  }

  if (response && typeof response === 'object') {
    const message = response.err_msg || response.errMsg || response.errorMessage
      || (typeof response.error === 'string' ? response.error : '');
    if (message) {
      return message;
    }

    if (response.status === 0 || response.status === '0' || response.success === false || response.failed === true) {
      return response.info || response.message || '上传失败';
    }
  }

  return '';
}

const isErrorFile = (file?: UploadFileLike) => {
  if (!file) {
    return false;
  }

  return getState(file.response) === 'error'
    || getState(file) === 'error'
    || !!getResponseError(file.response);
}

const omitTransientFileFields = (file: UploadFileLike) => {
  const result: Record<string, any> = { ...(file as any) };
  delete result.originFileObj;
  delete result.xhr;
  return result;
}

const normalizeFileList = (
  value: UploadFileLike[] | undefined,
  resolvePreview: (file?: UploadFileLike) => string | undefined
): UploadFile[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((file, index) => {
    const status = getState(file.response) || getState(file) || 'done';
    return {
      ...(file as any),
      uid: file.uid || String(index),
      name: file.name || file.title || `file-${index}`,
      status,
      url: getFileUrl(file),
      thumbUrl: resolvePreview(file),
    } as UploadFile;
  });
}

export const Upload: React.FC<React.PropsWithChildren<UploadProps>> = (props: React.PropsWithChildren<UploadProps>) => {
  const {
    value,
    onChange,
    previewUrl,
    oss,
    listType = 'picture-card',
    accept,
    action,
    data,
    beforeUpload,
    children,
    textContent,
    showUploadList,
    onPreview: onPreviewProp,
    ...restProps
  } = props;

  const field = useField();
  const policiesRef = React.useRef<Record<string, OssPolicy>>({});
  const failuresRef = React.useRef<Record<string, string>>({});
  const [previewImage, setPreviewImage] = React.useState('');
  const [previewOpen, setPreviewOpen] = React.useState(false);

  //保留@formily/antd Upload的失败反馈行为，兼容未更新x-validator的历史表单
  React.useEffect(() => {
    const formilyField: any = field;
    if (!formilyField || typeof formilyField.setFeedback !== 'function') {
      return;
    }

    const fileList = Array.isArray(value) ? value : [];
    const errorFile = fileList.find(isErrorFile);
    const message = errorFile
      ? (getResponseError(errorFile.response)
        || errorFile.response?.message
        || errorFile.response?.info
        || errorFile.errorMessage
        || errorFile.errMsg
        || errorFile.errorMsg
        || errorFile.message
        || (typeof errorFile.error === 'string' ? errorFile.error : '')
        || '文件上传失败')
      : '';

    formilyField.setFeedback({
      type: 'error',
      code: 'UploadError',
      messages: message ? [message] : [],
    });
  }, [value, field]);

  const getPolicy = (file?: UploadFileLike) => {
    return file?.uid ? policiesRef.current[file.uid] : undefined;
  };

  const resolvePreview = (file?: UploadFileLike) => {
    const url = getFileUrl(file);
    if (previewUrl) {
      const custom = previewUrl(file);
      if (custom) {
        return custom;
      }
    }

    const direct = file?.previewUrl
      || file?.thumbUrl
      || file?.preview_url
      || file?.thumb_url
      || getResponseField(file, 'previewUrl')
      || getResponseField(file, 'thumbUrl')
      || getResponseField(file, 'preview_url')
      || getResponseField(file, 'thumb_url');

    //oss直传的heic图片需要拼接转码参数才能在浏览器中预览
    if (oss && isHeicFile(file)) {
      return appendProcess(direct || url, OSS_HEIC_PROCESS);
    }

    return direct || url;
  };

  const buildOssData = (file: UploadFileLike) => {
    const policy = getPolicy(file) || {};
    return omitEmpty({
      key: `${policy.dir || ''}${getFileExt(file?.name)}`,
      OSSAccessKeyId: policy.accessid,
      policy: policy.policy,
      Signature: policy.signature,
      success_action_status: '200',
      callback: policy.callback,
      ...parseJson(policy.callback_var),
      ...parseJson(policy.oss_meta),
    });
  };

  const handleBeforeUpload = async (file: any, fileList?: any[]) => {
    let target: any = file;

    if (typeof beforeUpload === 'function') {
      const result = await beforeUpload(file, (fileList || []) as any);
      if (result === false || result === AntdUpload.LIST_IGNORE) {
        return result;
      }
      if (result !== undefined) {
        target = result;
      }
    }

    if (oss && typeof action === 'string' && action) {
      const title = (target && typeof target === 'object' && typeof target.name === 'string')
        ? target.name
        : (file?.name || '');

      try {
        const response = await fetch(withQuery(action, `title=${encodeURIComponent(title)}`));
        const policy = await response.json();
        if (!policy || (!policy.host && !policy.accessid)) {
          throw new Error('invalid policy');
        }

        policiesRef.current[file.uid] = policy;
        if (target && typeof target === 'object' && policy.host) {
          //先按oss规则推算出对象地址，上传成功后回调会返回最终地址
          const key = `${policy.dir || ''}${getFileExt(title)}`.replace(/^\/+/, '');
          target.url = `${String(policy.host).replace(/\/+$/, '')}/${key}`;
        }
      } catch (e) {
        //拿不到凭证时不再发出上传请求，避免把文件传到错误地址
        failuresRef.current[file.uid] = '获取上传凭证失败';
        return false;
      }
    }

    return target;
  };

  const resolveAction = (file: any) => {
    if (oss) {
      return getPolicy(file)?.host || '';
    }

    return typeof action === 'function' ? (action(file) as string) : (action || '');
  };

  const resolveData = (file: any) => {
    if (oss) {
      return buildOssData(file);
    }

    return typeof data === 'function' ? data(file) : (data || {});
  };

  const transformFile = (file: UploadFileLike) => {
    const response = file.response;
    const failure = file.uid ? failuresRef.current[file.uid] : '';
    const error = failure || getResponseError(response);

    if (error) {
      return {
        ...omitTransientFileFields(file),
        status: 'error',
        response: { errorMessage: error },
      };
    }

    if (file.status !== 'done') {
      return {
        ...omitTransientFileFields(file),
        status: file.status,
        response,
      };
    }

    return {
      status: 'done',
      name: file.name,
      file_id: getResponseField(file, 'file_id') || file.file_id,
      file_url: getResponseField(file, 'file_url')
        || getResponseField(file, 'url')
        || file.file_url,
      url: getFileUrl(file),
    };
  };

  const handleChange = (param: any) => {
    if (typeof onChange !== 'function') {
      return;
    }

    //antd的onChange回调参数为{fileList}对象，formily直接传递文件数组，两种形式都兼容
    const fileList = Array.isArray(param) ? param : param?.fileList;
    if (!Array.isArray(fileList)) {
      return;
    }

    onChange(fileList.map(transformFile));
  };

  const handlePreview = (file: UploadFileLike) => {
    if (typeof onPreviewProp === 'function') {
      onPreviewProp(file as any);
      return;
    }

    const url = resolvePreview(file);
    if (url) {
      setPreviewImage(url);
      setPreviewOpen(true);
    }
  };

  const mergedShowUploadList = showUploadList === false
    ? false
    : {
        showDownloadIcon: true,
        showRemoveIcon: true,
        showPreviewIcon: true,
        ...(typeof showUploadList === 'object' && showUploadList ? showUploadList : {}),
      };

  return <>
    <AntdUpload
      {...restProps}
      accept={addHeicAccept(accept)}
      action={resolveAction}
      data={resolveData}
      beforeUpload={handleBeforeUpload}
      fileList={normalizeFileList(value, resolvePreview)}
      listType={listType}
      onChange={handleChange}
      onPreview={handlePreview}
      showUploadList={mergedShowUploadList}
    >
      {children || (listType === 'picture-card'
        ? <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
        : <UploadTrigger>{textContent}</UploadTrigger>)}
    </AntdUpload>
    <Modal visible={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)}>
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
