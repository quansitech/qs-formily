# formily 组件库

[alibaba/formily](https://github.com/alibaba/formily) 的组件扩展，主要结合[quansitech/qs-cusform (github.com)](https://github.com/quansitech/qs-cusform)使用，也可以单独作为formily扩展组件来用

+ Area  中国城区选择器

+ Form  为qs-cusform开发的Form扩展

+ Text  静态文本

+ Upload  上传组件，支持本地直传和阿里云oss直传

```jsx
import { Upload } from '@quansitech/qs-formily'
```

工作方式

```text
1. oss=false（默认）：文件直接POST到action，字段名为file（antd默认），响应取file_id、file_url（或url）
2. oss=true：选择文件时先请求 {action}?title={filename} 获取OSS policy
   （host、accessid、policy、signature、callback、callback_var、oss_meta、dir）
   ，再携带policy字段直传到host，表单值仍是file_id、file_url、url
3. 两种方式都支持beforeUpload、data、previewUrl等属性覆盖默认行为
```

兼容性

```text
1. accept包含image/*时，自动补充image/heic、image/heif、.heic、.heif
2. oss直传时，heic/heif 的缩略图与预览会拼接 x-oss-process=image/format,jpg
3. 本地直传返回的json错误（status为0、err_msg）会标记为上传失败，不会当成成功落库
4. previewUrl(file) 优先于文件自身的 preview_url/thumb_url
```
