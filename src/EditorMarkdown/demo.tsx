import { EditorMarkdown, EditorThemeProvider, UploadFunction, useTiptap } from '@ctzhian/tiptap';
import { Box } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import '../index.css';

const Reader = () => {
  const [mdContent, setMdContent] = useState(":wolf:\n\n![s](https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg)\n\n本文用以记录 Gitlab 相关问题及解答\n\n## 我在使用 `git@git.in.chaitin.net:ns/repo` 时可以访问仓库，但是 `https://git.in.chaitin.net/ns/repo` 无法访问\n\n问题通常出现 git clone 与其他依赖 git 进行的操作，如 `go get` 等，具体报错可能为 `Permission Denied`.\n\n在使用 curl 借助 `CI_JOB_TOKEN` 获取其他仓库 cicd job 产物或者 generic package 时，其具体报错为 `404 Not Found` 的问题.\n\n原因是在使用 `git@git.in.chaitin.net` 时，使用的是 ssh 协议，此时默认使用的是 `~/.ssh` 下的私钥进行认证你在 gitlab 中添加的 `SSH Keys`。而使用 `https://git.in.chaitin.net/ns/repo` 时，使用的是 http 协议，此时默认使用的是 `~/.netrc` 认证你在 gitlab 中申请的 `Access tokens`。部分软件如 `go get` 默认使用的便是 http 来拉取代码，因此需要额外配置。\n\n这里推荐两种解决方案:\n\n1. 配置 `~/.netrc` 文件(推荐)\n\n   在 ~/.netrc 文件中添加以下配置:\n\n   ```text\n   machine git.in.chaitin.net login git password <your access token>\n   ```\n\n   在 gitlab cicd job 中遇到拉取其他仓库时遇到权限问题可以使用本配置，比如可以在 job 的 `before_script` 阶段添加以下命令:\n\n   ```shell\n   echo \"machine git.in.chaitin.net login git password $CI_JOB_TOKEN\" >> ~/.netrc\n   ```\n\n   注意: 其中 `$CI_JOB_TOKEN` 是 job 运行期间生成的 token，其权限与 trigger 用户相同，详见 [CI Job Token](https://docs.gitlab.com/ci/jobs/ci_job_token/)。其 Token 权限由 `pipeline 触发者`权限以及`目标仓库权限`共同决定。因此被拉取的目标仓库也需要保证其 `Setting -> CI/CD -> Job token permissions` 配置正确，允许源仓库的 CI/CD 能够访问到该仓库，否则依然会出现如 `404 Not Found`, `403 Forbidden` 的权限问题。（如果你是 pipeline 触发者，可以手动在浏览器通过 gitlab api 访问目标仓库的 generic package 或者 job artifact 如果可以正常下载，说明是 `Job token permissions` 问题）\n\n2. 配置 `git url replace`\n\n   在 ~/.gitconfig 文件中添加以下配置:\n\n   ```ini\n   [url \"git@git.in.chaitin.net:\"]\n     insteadOf = https://git.in.chaitin.net/\n   ```\n\n   这个配置可以将所有 `https://git.in.chaitin.net/` 请求替换为 `git@git.in.chaitin.net:` 使用 ssh 来拉取代码仓库\n\n## 我在 clone gitlab 仓库时没问题，但是 lfs 遇到了 EOF 问题\n\nEOF 在大多数情况下由代理导致，如果代理不允许客户端访问某个网站，行为可能是提早结束连接，导致 `EOF` 错误。如\n\n> 在 ubunu 虚拟机里无法拉取 safeline-aliyun 项目里的 lfs 文件怎么处理？\n\n```bash\nroot@OPS-5108:~/proj/safeline-aliyun# git lfs fetch --all\nfetch: 34 object(s) found, done.\nfetch: Fetching all references...\nbatch response: Post https://git.in.chaitin.net/patronus/safeline-aliyun.git/info/lfs/objects/batch: EOF\nerror: failed to fetch some objects from 'https://git.in.chaitin.net/patronus/safeline-aliyun.git/info/lfs'\n```\n\n可以看到返回了 EOF 问题，经查代理未配置在 git config 中。从 `env` 中可以看到用户配置了 *_proxy 但其中发现 `no_proxy` 配置不正确:\n\n```shell\nroot@OPS-5108:~/proj/safeline-aliyun# env | grep pro\nno_proxy=localhost, 127.0.0.1, ::1\nPWD=/root/proj/safeline-aliyun\nftp_proxy=http://proxy.in.chaitin.net:8123\nhttps_proxy=http://proxy.in.chaitin.net:8123\nproxy=http://proxy.in.chaitin.net:8123\nhttp_proxy=http://proxy.in.chaitin.net:8123\nOLDPWD=/root/proj\n```\n\n需要按照 [代理配置](https://info.chaitin.net/colab-editor/page/%E7%A0%94%E5%8F%91%E4%BD%93%E7%B3%BB%2F%E7%A0%94%E5%8F%91%E6%94%AF%E6%8C%81%2F%E4%BB%A3%E7%90%86%E6%89%AB%E7%9B%B2) 进行正确配置后，重新执行操作，发现 EOF 问题被解决。\n\n## 我在访问公司内部服务时报错 `x509: certificate signed by unknown authority`\n\n公司部分内部服务采用自签名证书，导致客户端在访问这些服务时会遇到 `x509: certificate signed by unknown authority` 错误。为了确保客户端能够信任这些自签名证书，你需要配置信任自签名证书即 CA。\n\n以 debian 系系统举例:\n\n```shell\ncurl -o /usr/local/share/ca-certificates/chaitin_ca.crt -L https://chaitin-ops-public.cn-beijing.oss.aliyuncs.com/Chaitin_Ltd_Root_CA.pem\nupdate-ca-certificates\n```\n\n如果无法访问外网，可以尝试 `http://s3-ephemeral.in.chaitin.net/dev/Chaitin_Ltd_Root_CA.pem`\n\n其他系统 CA 证书安装请参考 [安装CA证书](https://info.chaitin.net/colab-editor/page/IT%E5%8A%9E%E5%85%AC/%E5%8A%9E%E5%85%AC%E7%BD%91%E7%BB%9C/windows%E7%94%A8%E6%88%B7/%E5%A4%87%E9%80%89%E6%96%B9%E6%A1%88%EF%BC%88Windows%EF%BC%89/%E8%AF%81%E4%B9%A6%E5%AE%89%E8%A3%85%28windows%29/%E9%95%BF%E4%BA%AD%E6%A0%B9%E8%AF%81%E4%B9%A6%E5%AE%89%E8%A3%85%28windows%29)\n");

  const onUpload: UploadFunction = async (file: File, onProgress?: (progress: { progress: number }) => void) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 5;
        if (progress >= 100) {
          progress = 100;
          onProgress?.({ progress: progress / 100 });
          clearInterval(interval);
          setTimeout(() => {
            if (file.type.startsWith('image/')) {
              resolve('https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg')
            } else if (file.type.startsWith('video/')) {
              resolve('http://vjs.zencdn.net/v/oceans.mp4')
            } else {
              resolve('https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg')
            }
          }, 200);
        } else {
          onProgress?.({ progress: progress / 100 });
        }
      }, 100);
    })
  }

  const { editor } = useTiptap({
    editable: false,
    contentType: 'markdown',
    exclude: ['invisibleCharacters'],
    onError: (error: Error) => {
      console.error('Editor Error:', error)
    },
    onValidateUrl: async (url: string, type: 'image' | 'video' | 'audio' | 'iframe') => {
      console.log(`验证 ${type} 链接:`, url)

      // 拦截 base64 链接
      if (url.startsWith('data:')) {
        throw new Error(`不支持 base64 链接，请使用可访问的 ${type} URL`)
      }

      // 根据不同类型做不同的验证
      switch (type) {
        case 'image':
          if (!url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i)) {
            console.warn('图片链接可能不是有效的图片格式')
          }
          break
        case 'video':
          if (!url.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i)) {
            console.warn('视频链接可能不是有效的视频格式')
          }
          break
        case 'audio':
          if (!url.match(/\.(mp3|wav|ogg|m4a|flac|aac|wma)(\?.*)?$/i)) {
            console.warn('音频链接可能不是有效的音频格式')
          }
          break
        case 'iframe':
          // iframe 可以嵌入任何 URL，但可以检查是否是 HTTPS
          if (url.startsWith('http://') && !url.includes('localhost')) {
            console.warn('建议使用 HTTPS 链接以确保安全性')
          }
          break
      }

      return url
    },
    onSave: (editor) => {
      const value = editor.getMarkdown();
      console.log(value)
    },
    content: ''
  });

  const handleGlobalSave = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      const value = editor.getHTML();
      console.log(value)
    }
  }, [editor]);

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalSave);
    return () => {
      document.removeEventListener('keydown', handleGlobalSave);
    };
  }, [handleGlobalSave]);

  useEffect(() => {
    editor.commands.setContent(mdContent, {
      contentType: 'markdown'
    });
  }, [mdContent, editor])

  return <EditorThemeProvider mode='light'>
    <Box sx={{
      '.tiptap': {
        minHeight: '500px',
        '.tableWrapper': {
          maxWidth: '100%',
          overflowX: 'auto',
        },
      }
    }}>
      <EditorMarkdown
        editor={editor}
        height={'500px'}
        value={mdContent}
        splitMode={true}
        defaultDisplayMode='split'
        placeholder='请输入内容'
        onUpload={onUpload}
        onAceChange={setMdContent}
      />
    </Box>
  </EditorThemeProvider>
};

export default Reader;
