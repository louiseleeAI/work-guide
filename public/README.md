# 社群二维码图片放置说明

「加入社群」弹窗会按顺序尝试读取这两张图片：

| 文件 | 对应平台 |
|---|---|
| `public/qrcode-wechat.png` | 微信群 Tab |
| `public/qrcode-feishu.png` |飞书群 Tab |

## 怎么用

1. 从微信群 / 飞书群里保存群二维码图片
2. 改名为 `qrcode-wechat.png` / `qrcode-feishu.png`
3. 放到本目录下
4. 刷新页面

图片存在时会直接显示真实二维码；不存在时会退回到「指向本站的占位码」，
并在二维码位置显示提示文案，不会静默失败。

## 尺寸建议

正方形，建议至少 600×600 px。二维码区最大显示 260px，
高分辨率图在保存下载时也不会糊。

## 飞书的「点击加入」按钮

飞书支持深链，可以直接跳转到加入页面。在
`src/components/CommunityDialog.tsx` 的 `PLATFORMS` 配置里，
填上飞书群的 `joinUrl`，那个深色主按钮就会出现：

```ts
{
  id: 'feishu',
  // ...
  joinable: true,
  joinLabel: '点击加入飞书群',
  joinUrl: 'https://applink.feishu.cn/client/chat/你的群ID',
}
```

微信不支持这种深链，只能扫码，所以 `joinable` 保持 `false`。

## 有效期文案

在 `PLATFORMS` 配置里改：
- 微信的 `expiry` 目前写的是「长期有效」，但微信群二维码实际可能过期，
  建议你按群的实际情况改，比如「此二维码将于 2027 年 1 月 7 日前有效」
- 飞书群二维码通常长期有效，保留「永久有效」的说法即可