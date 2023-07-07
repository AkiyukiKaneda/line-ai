# Node.jsのLTSバージョンをベースとする
FROM node:16

# アプリケーションディレクトリを作成する
WORKDIR /usr/src/app

# アプリケーションの依存関係をインストールするためのファイルをコピーする
COPY package*.json ./
COPY yarn.lock ./

# 依存関係をインストールする
RUN yarn install

# アプリケーションのソースをバンドルする
COPY . .

# TypeScriptをコンパイルする
RUN yarn build

# ポートを開放する
EXPOSE 8080

# コマンドを実行する
CMD ["yarn", "start:prod"]
