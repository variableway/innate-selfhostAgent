## GITHUB Config

在 GitHub 中添加 SSH，通常包含两个核心部分：1. 在本地生成 SSH 密钥对；2. 将生成的公钥添加到你的 GitHub 账户中。整个过程可以通过几个简单的命令完成。

🔑 1. 生成 SSH 密钥对

打开终端（Terminal）或 Git Bash，执行以下命令来生成一个新的 SSH 密钥对。建议使用更现代的 Ed25519 算法。

ssh-keygen -t ed25519 -C "your_email@example.com"

请务必将命令中的 your_email@example.com 替换为你在 GitHub 上注册的邮箱地址。
系统会提示你输入保存密钥的文件名，直接按回车键即可使用默认路径 ~/.ssh/id_ed25519。
接下来会要求你输入一个密码（passphrase）来保护私钥。你可以选择输入以增加安全性，或者直接按回车键留空。如果设置了密码，后续操作时会需要输入。

📋 2. 将公钥复制到剪贴板

密钥生成后，你需要将公钥（.pub 文件）的内容复制到剪贴板。

在 macOS 上：
pbcopy < ~/.ssh/id_ed25519.pub

在 Windows 上 (Git Bash)：
clip < ~/.ssh/id_ed25519.pub

在 Linux 上或上述命令无效时：
你可以直接在终端打印出公钥内容，然后手动全选并复制。
cat ~/.ssh/id_ed25519.pub

注意： 请确保复制的是以 ssh-ed25519 或 ssh-rsa 开头，以你的邮箱结尾的整段文本，不要遗漏任何字符。

⚙️ 3. 启动 SSH Agent 并添加私钥

ssh-agent 是一个用于管理 SSH 密钥的程序。启动它并将你的私钥添加进去，可以方便地进行身份验证。

启动 ssh-agent
eval "$(ssh-agent -s)"

将私钥添加到 ssh-agent
ssh-add ~/.ssh/id_ed25519

如果你在生成密钥时使用了自定义的文件名，请将上面命令中的 id_ed25519 替换为你的私钥文件名。

🌐 4. 在 GitHub 账户中添加公钥

登录 GitHub，点击右上角头像，选择 Settings。
在左侧菜单的 "Access" 部分，点击 SSH and GPG keys。
点击 New SSH key 按钮。
在 "Title" 栏中，为这个密钥起一个描述性的名字，例如 "My Laptop"。
在 "Key" 栏中，粘贴你之前复制的公钥内容。
点击 Add SSH key 保存。

✅ 5. 测试连接

最后，通过以下命令测试 SSH 连接是否成功。

ssh -T git@github.com

如果是第一次连接，系统会提示你确认 GitHub 的指纹，输入 yes 并回车。如果看到类似 Hi username! You've successfully authenticated... 的消息，就表示配置成功了。