FROM golang:1.22 AS builder

WORKDIR /go/src/app
COPY . .

RUN go get -d -v ./...
RUN go build -o /go/bin/app

# 配信ステージ
FROM debian:latest

COPY --from=builder /go/bin/app /app
# ビルドステージから.envファイルをコピー
COPY --from=builder /go/src/app/.env /.env

EXPOSE 8080
CMD ["/app"]