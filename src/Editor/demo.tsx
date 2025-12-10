import { Editor, EditorThemeProvider, EditorToolbar, TocList, UploadFunction, useTiptap } from '@ctzhian/tiptap';
import { Box } from '@mui/material';
import { Editor as TiptapEditor } from '@tiptap/core';
import React from 'react';
import '../index.css';

const EDITABLE = true
const DEFAULT_CONTENT_TYPE = 'html'
const DEFAULT_HTML_CONTENT = `<p></p>
<table style=\"--default-cell-min-width: 100px; min-width: 700px;\"><colgroup><col><col><col><col><col><col><col></colgroup><tbody><tr class=\"table-row\"><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>1</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>2</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>3</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>4</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>5</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>6</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>7</p></td></tr><tr class=\"table-row\"><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>q</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>w</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>e</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>r</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>t</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>y</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>u</p></td></tr><tr class=\"table-row\"><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>a</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>s</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>d</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>f</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>g</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>h</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>j</p></td></tr><tr class=\"table-row\"><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>z</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>x</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>c</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>v</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>b</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>n</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>m</p></td></tr><tr class=\"table-row\"><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>i</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>o</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>p</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>k</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>l</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>8</p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" style=\"\"><p>9</p></td></tr></tbody></table>
<hr />
<div data-type=\"flip-grid\" class=\"flip-grid\"><div data-type=\"flip-grid-column\" data-width=\"42.99\" style=\"width: 42.99%;\"><p><span>PandaWiki 是一款 AI 大模<code>型驱动的开源知识库搭</code>建系统，F<strong>AQ 、 博客系统 ，借助大模型的力量为你提供 AI </strong>创作 、 AI 问答 、 AI 搜索 等能力。借</span><span style=\"color: rgb(90, 141, 218);\">助大模型的</span><span style=\"background-color: rgb(255, 204, 188); color: rgb(90, 141, 218);\">力量为你提</span><span style=\"color: rgb(90, 141, 218);\">供 AI 创</span><span>作能力。PandaWiki 是<u>一款 AI 大模型驱动的开源知识库搭建系统，帮</u>助你快速构建智能化的 <s><u>产品文档、技术</u></s>文档、FAQ 、<s> 博客系统 ，借助大模型的</s>力量系统 ，</span><span style=\"background-color: rgb(172, 84, 84);\">借助大模型的力量为你提供 AI 创作 、 AI 问</span><span>答 、 AI 搜索 等能力。的力量为<mark>你提供 AI 创作 、 AI 问答 、</mark> AI 搜索。</span></p></div><div data-type=\"flip-grid-column\" data-width=\"38.92\" style=\"width: 38.92%;\"><pre><code>var a = 1;\nvar b = 2;\n\nfunction sum(a, b) {\n  return a + b\n}</code></pre></div><div data-type=\"flip-grid-column\" data-width=\"18.09\" style=\"width: 18.09%;\"><ul class=\"bullet-list\" data-type=\"bulletList\"><li><p>放假啊但是可</p></li><li><p>放的时间放假</p></li><li><p>可参考</p></li><li><p>顺丰打卡啦</p></li></ul></div></div>
<div data-type=\"flip-grid\" class=\"flip-grid\" style=\"display: flex;\">
<div data-type=\"flip-grid-column\" class=\"flip-grid-column\" data-width=\"25.2\" style=\"position: relative; padding: 8px; width: 25.2%;\">
<div class=\"flip-grid-column-inner\"><p>发家史滴漏咖啡就是那份独守空房放假啊 sd 卡雷锋精神大联考放假啊但是浪费放假卡的私人飞机可能啥地方就是了快递费就是那客服发上来的咖啡叫啥了的看法就开始大润发健康啥的发链接沙发那是地方发烧的减肥开始你的房间杀人犯看见啥了开房间卡死了放假啥了</p></div></div>
<div data-type=\"flip-grid-column\" class=\"flip-grid-column\" data-width=\"74.8\" style=\"position: relative; padding: 8px; width: 74.8%;\">
<div class=\"flip-grid-column-inner\"><p>放假啥你的看法就是那肯定解封了刷卡的就分开了煞风景可能沙发今年是的浪费空间收到那就法拉第会计分录深咖啡就是你的放假了刷卡发家史伐地那非今年开始放假了看电视剧菲尼克斯大姐夫年卡是 fsa.f，手机辐射都放假了卡萨帝解封了沙发就是那客服就是那地方就啊舒服了啥发烧那块地方健康那是放假啊你</p></div></div></div>
<table style=\"min-width: 400px;\"><colgroup><col style=\"min-width: 100px;\"><col style=\"min-width: 100px;\"><col style=\"min-width: 100px;\"><col style=\"min-width: 100px;\"></colgroup><tbody><tr class=\"table-row\"><th class=\"table-header\" colspan=\"1\" rowspan=\"1\" style=\"\"><p></p></th><th class=\"table-header\" colspan=\"1\" rowspan=\"1\" style=\"\"><p></p></th><th class=\"table-header\" colspan=\"1\" rowspan=\"1\" style=\"\"><p></p></th><th class=\"table-header\" colspan=\"1\" rowspan=\"1\" style=\"\"><p></p></th></tr><tr class=\"table-row\"><td colspan=\"1\" rowspan=\"1\" style=\"\"><p></p></td><td colspan=\"1\" rowspan=\"1\" style=\"\"><p></p></td><td colspan=\"1\" rowspan=\"1\" style=\"\">
  <table style=\"min-width: 200px;\"><colgroup><col style=\"min-width: 100px;\"><col style=\"min-width: 100px;\"></colgroup><tbody><tr class=\"table-row\"><th class=\"table-header\" colspan=\"1\" rowspan=\"1\" style=\"\"><p></p></th><th class=\"table-header\" colspan=\"1\" rowspan=\"1\" style=\"\"><p></p></th></tr><tr class=\"table-row\"><td colspan=\"1\" rowspan=\"1\" style=\"\"><p></p></td><td colspan=\"1\" rowspan=\"1\" style=\"\"><p></p></td></tr></tbody></table>
</td><td colspan=\"1\" rowspan=\"1\" style=\"\"><p></p></td></tr><tr class=\"table-row\"><td colspan=\"1\" rowspan=\"1\" style=\"\"><p></p></td><td colspan=\"1\" rowspan=\"1\" style=\"\"><p></p></td><td colspan=\"1\" rowspan=\"1\" style=\"\"><p></p></td><td colspan=\"1\" rowspan=\"1\" style=\"\"><p></p></td></tr></tbody></table>
<ol class=\"ordered-list\" data-type=\"orderedList\"><li><p>放假杀人的方式阿凡达</p></li><li><p>发烧大润发看见</p><ol class=\"ordered-list\" data-type=\"orderedList\"><li><p>发就算了快递费</p><ol class=\"ordered-list\" data-type=\"orderedList\"><li><p>放假啊但是你看放假啊虽然放</p></li></ol></li></ol></li></ol>
<ul class=\"bullet-list\" data-type=\"bulletList\"><li><p>发家史你的看法</p></li><li><p>发生的激烈反抗啥的就发的是放假了</p><ul class=\"bullet-list\" data-type=\"bulletList\"><li><p>发烧的福利肯定撒酒疯那可是打飞机啊是你的客服就是大润发</p></li><li><p>发生的浪费空间啥的南方巨兽龙的看法静安寺店理发师解放东路</p><ul class=\"bullet-list\" data-type=\"bulletList\"><li><p>发生的发发顺丰那可是打飞机啊虽然客服</p></li></ul></li></ul></li></ul>
<ul data-type=\"taskList\"><li class=\"task-item\" data-type=\"taskItem\" data-checked=\"false\"><label><input type=\"checkbox\"><span></span></label><div><p>发啥的</p></div></li><li class=\"task-item\" data-type=\"taskItem\" data-checked=\"true\"><label><input type=\"checkbox\" checked=\"checked\"><span></span></label><div><p>发啥呆你</p><ul data-type=\"taskList\"><li class=\"task-item\" data-type=\"taskItem\" data-checked=\"false\"><label><input type=\"checkbox\"><span></span></label><div><p>发大了</p><ul data-type=\"taskList\"><li class=\"task-item\" data-type=\"taskItem\" data-checked=\"false\"><label><input type=\"checkbox\"><span></span></label><div><p>发的时间来看</p></div></li></ul></div></li></ul></div></li></ul>
<pre data-title=\"安装目录\"><code>var a = 1;</code></pre>
<p><img src=\"https://fuss10.elemecdn.com/8/27/f01c15bb73e1ef3793e64e6b7bbccjpeg.jpeg\" width=\"100\"></p>
<p><img src=\"https://fuss10.elemecdn.com/3/28/bbf893f792f03a54408b3b7a7ebf0jpeg.jpeg\" width=\"100\"></p>
<h6 id="4b8d8c4e-29dc-4674-928b-b9ded0e363ae" data-toc-id="4b8d8c4e-29dc-4674-928b-b9ded0e363ae"><span data-name="watch" data-type="emoji">⌚</span> 表格操作</h6>
<table><tbody><tr class=\"table-row\"><th class=\"table-header\" colspan=\"1\" rowspan=\"1\" data-background-color=\"\" data-text-align=\"center\" style=\"text-align: center;\"><p>链接</p></th><th class=\"table-header\" colspan=\"1\" rowspan=\"1\" data-background-color=\"\" data-text-align=\"center\" style=\"text-align: center;\"><p>复杂文本</p></th><th class=\"table-header\" colspan=\"1\" rowspan=\"1\" data-background-color=\"\" data-text-align=\"center\" style=\"text-align: center;\"><p>图片</p></th><th class=\"table-header\" colspan=\"1\" rowspan=\"1\" data-background-color=\"\" data-text-align=\"center\" style=\"text-align: center;\"><p>附件</p></th></tr><tr class=\"table-row\"><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" data-text-align=\"center\" data-vertical-align=\"middle\" style=\"text-align: center; vertical-align: middle;\"><p><a target=\"_blank\" class=\"MuiBox-root css-1ivg9gg\" type=\"icon\" rel=\"noopener noreferrer\" title=\"点击此处跳转\" href=\"http://localhost:8000/components/editor\">点击此处跳转</a></p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" data-text-align=\"center\" data-vertical-align=\"middle\" style=\"text-align: center; vertical-align: middle;\"><p><code>知</code><span style=\"background-color: rgb(255, 204, 188); color: rgb(90, 141, 218);\">力</span><span style=\"color: rgb(90, 141, 218);\">供</span><sup>历</sup><sub>史</sub><u>动</u><s>大</s><span style=\"background-color: rgb(172, 84, 84);\">借</span><mark>答</mark></p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" data-text-align=\"center\" data-vertical-align=\"middle\" style=\"text-align: center; vertical-align: middle;\"><p><img src=\"https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg\" width=\"100\"></p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" data-text-align=\"center\" data-vertical-align=\"middle\" style=\"text-align: center; vertical-align: middle;\"><p><span data-tag=\"attachment\" url=\"\" title=\"\" size=\"0\" data-url=\"https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg\" data-title=\"谁是我们的敌人.txt\" data-size=\"18.27 KB\"></span></p></td></tr><tr class=\"table-row\"><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" data-text-align=\"center\" style=\"text-align: center;\"><video src=\"https://media.w3.org/2010/05/sintel/trailer.mp4\" controls=\"true\" width=\"75%\"></video></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" data-text-align=\"center\" style=\"text-align: center;\"><p></p><audio src=\"http://vjs.zencdn.net/v/oceans.mp4\" controls=\"true\"></audio></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" data-text-align=\"center\" style=\"text-align: center;\"><p></p></td><td colspan=\"1\" rowspan=\"1\" data-background-color=\"\" data-text-align=\"center\" style=\"text-align: center;\"><p></p></td></tr></tbody></table>
<p><img src=\"https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg\" width=\"100\"></p>
<h6 id="a025f782-910f-4f17-9d0b-8f31f9cde175" data-toc-id="a025f782-910f-4f17-9d0b-8f31f9cde175"><span data-name="page_facing_up" data-type="emoji">📄</span> 文本处理</h6>
<p>PandaWiki 是一款 AI 大模<code>型驱动的开源知识库搭</code>建系统，F<strong>AQ 、 博客系统 ，借助大模型的力量为你提供 AI </strong>创作 、 AI 问答 、 AI 搜索 等能力。借<span style="color: rgb(90, 141, 218);">助大模型的</span><span style="background-color: rgb(255, 204, 188); color: rgb(90, 141, 218);">力量为你提</span><span style="color: rgb(90, 141, 218);">供 AI 创</span>作能力。PandaWiki 是<u>一款 AI 大模型驱动的开源知识库搭建系统，帮</u>助你快速构建智能化的 <s><u>产品文档、技术</u></s>文档、FAQ 、<s> 博客系统 ，借助大模型的</s>力量系统 ，<span style="background-color: rgb(172, 84, 84);">借助大模型的力量为你提供 AI 创作 、 AI 问</span>答 、 AI 搜索 等能力。的力量为<mark>你提供 AI 创作 、 AI 问答 、</mark> AI 搜索。</p>
<a target=\"_blank\" type=\"block\" href=\"http://localhost:8000/components/editor\" title=\"看风景\">看风景</a>
<h6>📎 附件</h6>
<div data-tag=\"attachment\" url=\"\" title=\"\" size=\"0\" data-url=\"https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg\" data-title=\"谁是我们的敌人？谁是我们的朋友？这个问题是革命的首要问题。中国过去一切革命斗争成.txt\" data-size=\"18.27 KB\"></div>
<p>行内附件：<span data-tag=\"attachment\" url=\"\" title=\"\" size=\"0\" data-url=\"https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg\" data-title=\"font_4856251_qynqqohzdp.js\" data-size=\"412.34 KB\"></span><span data-tag=\"attachment\" url=\"\" title=\"\" size=\"0\" data-url=\"https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg\" data-title=\"雷池项目设计方案.docx\" data-size=\"635.74 KB\"></span></p>
<div data-tag=\"attachment\" url=\"\" title=\"\" size=\"0\" data-url=\"https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg\" data-title=\"b0f4a3e0-639f-4c09-ab33-ea9417939f87.tiff\" data-size=\"3.03 MB\"></div>
<div data-tag=\"attachment\" url=\"\" title=\"\" size=\"0\" data-url=\"https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg\" data-title=\"长亭科技公司介绍PPT-25.07.007_副本.pptx\" data-size=\"40.18 MB\"></div>
<h6><span data-name=\"loudspeaker\" data-type=\"emoji\">📢</span> 音频</h6>
<audio src=\"http://vjs.zencdn.net/v/oceans.mp4\" controls=\"true\"></audio>
<h6 id="1739ed5e-f03c-4c2f-b763-37505601c935" data-toc-id="1739ed5e-f03c-4c2f-b763-37505601c935"><span data-name="video_camera" data-type="emoji">📹</span> 视频</h6>
<video src="https://media.w3.org/2010/05/sintel/trailer.mp4" controls="true" width="400" data-align="center"></video>
<h6 id="746ea233-0e30-44a6-849a-090202217299" data-toc-id="746ea233-0e30-44a6-849a-090202217299">⚠️ 警告块</h6>
<div data-id="alert_5ysakwbhvqv" data-variant="warning" data-type="icon" data-node="alert"><p>此时这是一个警告块。</p></div>
<h6 id="ebb64062-9efb-4de8-887f-7f8b7f9e54ca" data-toc-id="ebb64062-9efb-4de8-887f-7f8b7f9e54ca"><span data-name="bar_chart" data-type="emoji">📊</span> 流程图操作</h6>
<div data-type="flow" data-code="mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness&lt;br/&gt;and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid" data-width="246px"></div>
`
const DEFAULT_MARKDOWN_CONTENT = "###### :page_facing_up: 文本处理\n\nPandaWiki 是一款 AI 大模`型驱动的开源知识库搭`建系统，F**AQ 、 博客系统 ，借助大模型的力量为你提供 AI **创作 、 AI 问答 、 AI 搜索 等能力。借助大模型的力量为你提供 AI 创作能力。PandaWiki 是++一款 AI 大模型驱动的开源知识库搭建系统，帮++助你快速构建智能化的 ++~~产品文档、技术~~++文档、FAQ 、~~ 博客系统 ，借助大模型的~~力量系统 ，借助大模型的力量为你提供 AI 创作 、 AI 问答 、 AI 搜索 等能力。的力量为==你提供 AI 创作 、 AI 问答 、== AI 搜索。\n\n###### :video_camera: 视频\n\n<video src=\"https://media.w3.org/2010/05/sintel/trailer.mp4\" width=\"400\" controls     ></video>\n\n###### ⚠️ 警告块\n\n:::alert {#alert_5ysakwbhvqv indent=\"0\" variant=\"warning\" type=\"icon\"}\n\n此时这是一个警告块。\n\n:::\n\n###### :bar_chart: 流程图操作\n\n```mermaid\nmindmap\n  root((mindmap))\n    Origins\n      Long history\n      ::icon(fa fa-book)\n      Popularisation\n        British popular psychology author Tony Buzan\n    Research\n      On effectiveness<br/>and features\n      On Automatic creation\n        Uses\n            Creative techniques\n            Strategic planning\n            Argument mapping\n    Tools\n      Pen and paper\n      Mermaid\n```\n\n###### :watch: 表格操作\n\n\n| 链接                                                                                          | 复杂文本                        | 图片                                                                           | 附件                                                                                                                                       |\n| ------------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |\n| [点击此处跳转](http://localhost:8000/components/editor)                                           | `知`力供^历^~史~++动++~~大~~借==答== | ![](https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg) | <a href=\"https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg\" target=\"_blank\" download=\"谁是我们的敌人.txt\">谁是我们的敌人.txt</a> |\n| <video src=\"https://media.w3.org/2010/05/sintel/trailer.mp4\" width=\"75%\" controls ></video> | \u001f                           |                                                                              |                                                                                                                                          |\n\n\n"

const Reader = () => {
  // @ts-ignore
  const isHtmlMode = DEFAULT_CONTENT_TYPE === 'html'
  const content = isHtmlMode ? DEFAULT_HTML_CONTENT : DEFAULT_MARKDOWN_CONTENT
  const handleSave = (editor: TiptapEditor) => {
    const value = isHtmlMode ? editor.getHTML() : editor.getMarkdown();
    console.log(`⬇️ ========= ${DEFAULT_CONTENT_TYPE} mode ========= ⬇️`)
    console.log(`%c${JSON.stringify(value)}`, 'color: #42b983;');
    console.log(`⬆️ ========= end ========= ⬆️`)
  }
  const handleError = (error: Error) => {
    alert(error.message)
  }
  const handleAiWritingGetSuggestion = async ({ prefix, suffix }: { prefix: string, suffix: string }) => {
    console.log('onAiWritingGetSuggestion', prefix, suffix);
    return new Promise<string>((resolve) => {
      resolve([
        'this is a default suggestion.',
        'we are good.',
        'what is your name?',
        'how are you?',
        'what is your favorite color?',
        'what is your favorite food?',
        'what is your favorite animal?',
        'what is your favorite book?',
        'what is your favorite movie?',
        'what is your favorite song?',
        'what is your favorite artist?',
        'what is your favorite band?',
        'what is your favorite city?',
        'what is your favorite country?',
        'what is your favorite sport?',
      ][Math.floor(Math.random() * 10)]);
    })
  }
  const handleUpload: UploadFunction = async (file: File, onProgress?: (progress: { progress: number }) => void) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
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
  const handleTocUpdate = (toc: TocList) => {
    // console.log('toc', toc)
  }
  const handleValidateUrl = async (url: string, type: 'image' | 'video' | 'audio' | 'iframe') => {
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
  }
  const { editor } = useTiptap({
    editable: EDITABLE,
    content,
    contentType: DEFAULT_CONTENT_TYPE,
    exclude: ['invisibleCharacters'],
    onError: handleError,
    onValidateUrl: handleValidateUrl,
    onSave: handleSave,
    onAiWritingGetSuggestion: handleAiWritingGetSuggestion,
    onTocUpdate: handleTocUpdate,
    onUpload: handleUpload,
    // onMentionFilter: async ({ query }: { query: string }) => {
    //   return new Promise((resolve) => {
    //     resolve([
    //       'Winona Ryder',
    //       'Molly Ringwald',
    //       'Ally Sheedy',
    //       'Debbie Harry',
    //       'Olivia Newton-John',
    //       'Elton John',
    //       'Michael J. Fox',
    //       'Axl Rose',
    //       'Emilio Estevez',
    //       'Ralph Macchio',
    //       'Rob Lowe',
    //       'Jennifer Grey',
    //     ].filter(item => item.toLowerCase().startsWith(query.toLowerCase()))
    //       .slice(0, 5))
    //   })
    // },
  });

  // const handleGlobalKeydown = useCallback(
  //   (event: KeyboardEvent) => {
  //     if ((event.ctrlKey || event.metaKey) && event.key === 's') {
  //       event.preventDefault();
  //       handleSave(editor)
  //     }
  //   },
  //   [editor],
  // );

  // useEffect(() => {
  //   document.addEventListener('keydown', handleGlobalKeydown);
  //   return () => {
  //     document.removeEventListener('keydown', handleGlobalKeydown);
  //   };
  // }, [handleGlobalKeydown]);

  return <EditorThemeProvider mode='light'>
    <Box sx={{
      border: '1px solid #eee',
      borderRadius: '10px',
      padding: '0 10px 10px',
      bgcolor: 'var(--mui-palette-background-default)',
    }}>
      {EDITABLE && <div style={{
        borderBottom: '1px solid #eee',
        marginBottom: '30px',
      }}>
        <EditorToolbar editor={editor} mode='advanced' />
      </div>}
      <Box sx={{
        '.tiptap': {
          minHeight: '500px',
          '.tableWrapper': {
            maxWidth: '100%',
            overflowX: 'auto',
          },
        }
      }}>
        <Editor editor={editor} />
      </Box>
    </Box>
  </EditorThemeProvider>
};

export default Reader;
