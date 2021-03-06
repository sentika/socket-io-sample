import { Socket } from 'socket.io';
import { ChatEvent, IChatMessage, toChatMessage } from './entities';
import cluster from 'cluster';

export class Connection {
    constructor(
        private _socket: Socket,
        private _room: string,
        private _userName: string
    ) {
    }

    public onConnection() {
        console.log(ChatEvent.Connection, this._userName, 'workerId:', cluster.worker.id, 'roomId:', this._room);

        this._socket.join([this._room, this._userName]);

        this._socket.emit(ChatEvent.Notification, {
            room: this._room,
            userName: this._userName,
        });

        this._socket.on(ChatEvent.Disconnect, this.onDisconnect.bind(this));
        this._socket.on(ChatEvent.Message, this.onMessage.bind(this));
    }

    public onMessage(msgRaw, cb: (msg: IChatMessage) => void) {
        const preparedMsg: IChatMessage = toChatMessage(msgRaw);

        if (cb) cb(preparedMsg);

        this._socket.to(this._room).emit(ChatEvent.Message, preparedMsg);
    }

    public onDisconnect() {
        console.log(ChatEvent.Disconnect, this._socket.id);
    }
}
