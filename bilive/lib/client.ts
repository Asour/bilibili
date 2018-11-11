import ws from 'ws'
import { EventEmitter } from 'events'
import tools from './tools'
/**
 * Bilive客户端, 用于连接服务器和发送事件
 *
 * @class Client
 * @extends {EventEmitter}
 */
class Client extends EventEmitter {
  /**
   * Creates an instance of Client.
   * @param {string} server
   * @param {string} protocol
   * @memberof Client
   */
  constructor(server: string, protocol: string) {
    super()
    this._server = server
    this._protocol = protocol
  }
  /**
   * 服务器地址
   *
   * @protected
   * @type {string}
   * @memberof Client
   */
  protected _server: string
  /**
   * protocol
   *
   * @protected
   * @type {string}
   * @memberof Client
   */
  protected _protocol: string
  /**
   * WebSocket客户端
   *
   * @protected
   * @type {ws}
   * @memberof Client
   */
  protected _wsClient!: ws
  /**
   * 连接到指定服务器
   *
   * @memberof Client
   */
  public Connect() {
    if (this._wsClient !== undefined && this._wsClient.readyState === ws.OPEN) return
    this._wsClient = new ws(this._server, [this._protocol])
    this._wsClient
      .on('error', error => this._ClientErrorHandler(error))
      .on('close', () => this.Close())
      .on('message', (data: string) => this._MessageHandler(data))
  }
  /**
   * 断开与服务器的连接
   *
   * @memberof Client
   */
  public Close() {
    if (this._wsClient === undefined || this._wsClient.readyState !== ws.OPEN) return
    this._wsClient.close()
    this._wsClient.terminate()
    this._wsClient.removeAllListeners()
    // 发送关闭消息
    this.emit('close')
  }
  /**
   * 客户端错误
   *
   * @protected
   * @param {Error} error
   * @memberof Client
   */
  protected _ClientErrorHandler(error: Error) {
    this.emit('clientError', error)
    this.Close()
  }
  /**
   * 解析消息
   *
   * @protected
   * @param {string} data
   * @memberof Client
   */
  protected async _MessageHandler(data: string) {
    const message = await tools.JSONparse<message>(data)
    if (message !== undefined) this.emit(message.cmd, message)
  }
}
export default Client