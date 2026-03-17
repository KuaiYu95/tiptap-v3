import EditorDiff from '../EditorDiff';
import EditorThemeProvider from '../EditorThemeProvider';
import React from 'react';
import '../../../index.css';

const EditorDiffDemo = () => {
  return <EditorThemeProvider mode='light'>
    <EditorDiff
      oldHtml={`
        <p>发生大解放了卡上打飞机，发生简<a target="_blank" type="text" href="事实上" title="单快乐飞机">单快乐飞机</a>阿斯利康发的。</p><p><img src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" width="212"></p><p><span data-tag="attachment" url="" title="" size="0" data-url="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" data-title="images.jpeg" data-size="6.81 KB"></span></p><div data-tag="attachment" url="" title="" size="0" data-url="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" data-title="monkeycode-1.20.0.vsix" data-size="27.94 MB"></div><video class="video-wrapper" src="http://vjs.zencdn.net/v/oceans.mp4" controls="true" width="760"></video><audio class="audio-wrapper" src="http://vjs.zencdn.net/v/oceans.mp4" controls="true"></audio><details class="cq-details" open=""><summary>飞机阿里斯顿看风景</summary><div data-type="detailsContent"><p>这是<strong>一段很长的文</strong>本，雷池 <s>WAF</s> 是一款简单高<span style="color: rgb(216, 164, 127);">效的 Web 应</span>用防<span style="background-color: rgb(179, 229, 252);">火墙，能</span>有效防御 S<sup>L</sup> 注入、X<sub>SS</sub> 等各类 Web 攻击，提供访问频率限制、人机验证、动<code>态防护等</code>功能。<em>全</em><a target="_blank" type="icon" href="https://www.baidu.com" title="球装机量">球装机量</a><em>超 30 万台</em>，<u>日均处理 300 亿次请</u>求。<span data-latex="x + y = 1" data-type="inline-math"></span></p><div class="tableWrapper"><table style="min-width: 400px;"><colgroup><col style="min-width: 100px;"><col style="min-width: 100px;"><col style="min-width: 100px;"><col style="min-width: 100px;"></colgroup><tbody><tr class="table-row"><th class="table-header" colspan="1" rowspan="1"><p>1</p></th><th class="table-header" colspan="1" rowspan="1"><p>2</p></th><th class="table-header" colspan="1" rowspan="1"><p>3</p></th><th class="table-header" colspan="1" rowspan="1"><p>4</p></th></tr><tr class="table-row"><td colspan="1" rowspan="1" data-background-color="transparent" style="background-color: transparent;"><p>5</p></td><td colspan="1" rowspan="1" data-background-color="transparent" style="background-color: transparent;"><p>6</p></td><td colspan="1" rowspan="1" data-background-color="transparent" style="background-color: transparent;"><p>7</p></td><td colspan="1" rowspan="1" data-background-color="transparent" style="background-color: transparent;"><p>8</p></td></tr><tr class="table-row"><td colspan="1" rowspan="1" data-background-color="transparent" style="background-color: transparent;"><p>9</p></td><td colspan="1" rowspan="1" data-background-color="transparent" style="background-color: transparent;"><p>10</p></td><td colspan="1" rowspan="1" data-background-color="transparent" style="background-color: transparent;"><p>11</p></td><td colspan="1" rowspan="1" data-background-color="transparent" style="background-color: transparent;"><p>12</p></td></tr></tbody></table></div><div data-latex="x + y + z = 1" data-type="block-math"></div><pre><code>export const DetailsExtension = CustomDetails.configure({
  persist: true,
  openClassName: 'is-open',
  HTMLAttributes: {
    class: 'cq-details',
  },
});

export const DetailsSummaryExtension = DetailsSummary.configure({
});

export const DetailsContentExtension = DetailsContent.configure({
});</code></pre><ol class="ordered-list" data-type="orderedList"><li><p>这是列表</p></li><li><p>示例示例路上了</p></li></ol><blockquote><p>数据啊克利夫兰撒飞机拉卡上打飞机啊看到了地方。</p></blockquote></div></details><p></p>
        `}
      newHtml={`
        <p style="text-align: center;">发生大解放了卡<a target="_blank" type="text" href="https://www.baidu.com" title="上打飞机">上打飞机</a>，发生简<a target="_blank" type="icon" href="事实上" title="单快乐飞机">单快乐飞机</a>阿斯利康发的。</p><p><img src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" width="540"></p><div data-tag="attachment" url="" title="" size="0" data-url="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" data-title="images.jpeg" data-size="6.81 KB"></div><div data-tag="attachment" url="" title="" size="0" data-url="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" data-title="monkeycode-1.20.vsix" data-size="27.94 MB"></div><video class="video-wrapper" src="http://vjs.zencdn.net/v/oceans.mp4" controls="true" width="1017"></video><audio class="audio-wrapper" src="http://vjs.zencdn.net/v/oceans.mp4" title="收拾收拾" poster="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" controls="true"></audio><details class="cq-details" open=""><summary>就发生的快乐飞机阿里斯顿</summary><div data-type="detailsContent"><p>池 <s>W1111F</s> 是一款简单高<span style="color: rgb(216, 164, 127);">效的 </span><span style="color: rgb(254, 69, 69);">Web</span><span style="color: rgb(216, 164, 127);"> 应</span>用防<span style="background-color: rgb(179, 229, 252);">火，能</span>有效防御 S<sup>QL</sup> 注入、X<sub>SS</sub> 等各类 Web 攻击，提供访问频率限制、人机验证、动<code>态防收拾收拾等</code>功能。<em>全</em><a target="_blank" type="icon" href="https://www.baidu.com" title="球装机">球装机</a><em>超 30 万台</em>，<u>日均</u>处理 300 亿次<u>请</u>求。<span data-latex="x ^ 2 + y ^ 2=1" data-type="inline-math"></span></p><div class="tableWrapper"><table style="min-width: 537px;"><colgroup><col style="min-width: 100px;"><col style="width: 237px;"><col style="min-width: 100px;"><col style="min-width: 100px;"></colgroup><tbody><tr class="table-row"><th class="table-header" colspan="1" rowspan="1"><p>1</p></th><th class="table-header" colspan="1" rowspan="1" colwidth="237"><p>2</p></th><th class="table-header" colspan="1" rowspan="1"><p>3</p></th><th class="table-header" colspan="1" rowspan="1"><p>4</p></th></tr><tr class="table-row"><td colspan="1" rowspan="1" data-background-color="transparent" style="background-color: transparent;"><p>5</p></td><td colspan="1" rowspan="1" colwidth="237" data-background-color="transparent" style="background-color: transparent;"><p>6</p></td><td colspan="1" rowspan="1" data-background-color="transparent" style="background-color: transparent;"><p>7sfadfsaf</p></td><td colspan="1" rowspan="1" data-background-color="transparent" style="background-color: transparent;"><p></p></td></tr><tr class="table-row"><td colspan="1" rowspan="1" data-background-color="transparent" style="background-color: transparent;"><p>9</p></td><td colspan="1" rowspan="1" colwidth="237" data-background-color="transparent" style="background-color: transparent;"><p>10</p></td><td colspan="1" rowspan="1" data-background-color="transparent" style="background-color: transparent;"><p>11</p></td><td colspan="1" rowspan="1" data-background-color="transparent" style="background-color: transparent;"><p><strong>12</strong></p></td></tr></tbody></table></div><a target="_blank" type="block" href="http://localhost:8000/components/editor" title="解放撒的路口">解放撒的路口</a><div data-latex="x ^ 2 + y ^ 2 + z^2=1" data-type="block-math"></div><pre><code>export const DetailsExtension = CustomDetails.configure({
  persist: true,
  openClassName: 'is-open',
  HTMLAttributes: {
    class: 'cq-details',
  },
});

export const SummaryExtension = DetailsSummary.configure({
  HTMLAttributes: {
    class: 'cq-details',
  },
});

const persist = true;

export const ContentExtension = DetailsContent.configure({
  persist,
});</code></pre><ol class="ordered-list" data-type="orderedList"><li><p>这是<s>列表</s></p></li><li><p>示<span style="color: rgb(254, 69, 69);">例示例路</span>上了</p></li><li><p>法甲联赛肯德基</p></li></ol><blockquote><p>数据啊克<strong>利夫兰撒飞机拉卡上</strong>打飞机啊看到了地方</p></blockquote></div></details><p></p>
        `}
    />
  </EditorThemeProvider>
}

export default EditorDiffDemo
