import { errors } from "celebrate";
import compression from 'compression';
import cors from 'cors';
import * as dotenv from 'dotenv';
import type { Application, Request, Response } from 'express';
import express from 'express';
import * as http from "http";
import path from 'path';
import { fileURLToPath } from 'url';
import HttpStatus from './helpers/http-status.ts';
import errorMiddleware from './middleware/error.middleware.ts';
import { Routes } from './routes.ts';
import { SerialportConnectionService } from './services/serialport.connection.service.ts';
import SocketService from './services/socket.service.ts';
dotenv.config();
let port = 3339;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class appServer {
    socket: any;
    app: Application = express();

    private SerialConn: SerialportConnectionService = new SerialportConnectionService();
    private socketService = new SocketService();

    config(): Promise<number> {
        return new Promise(async (resolve, reject) => {
            console.log('Server Configured');

            this.app = express();

            this.app.use(cors());

            this.app.all("/{*splat}", (req, res, next) => {
                res.header("Access-Control-Expose-Headers", "Content-Disposition");
                next();
            });

            await this.SerialConn.connectToPort('COM19');
            // await this.SerialConn.connectToPort('COM2');
            // await this.SerialConn.disconnectPort();

            this.app.use(express.json({ limit: '50mb' }));
            this.app.use(express.urlencoded({ extended: true }));

            this.app.use(compression());

            const routes = new Routes();
            this.app.use('/api/', routes.path());

            this.app.use(errorMiddleware);

            this.app.use(errors());


            const clientRoot = path.resolve(__dirname, 'dist', 'client');
            this.app.use(express.static(clientRoot));

            this.app.get("/{*splat}", (req: Request, res: Response) => {
                res.sendFile(path.join(clientRoot, 'index.html'));
                // res.send("Server Running on port : " + port);
            });

            const server = http.createServer(this.app);
            this.listen(server, resolve, reject);

            this.socketService.init(server);

            // const io = new Server(server, {
            //     cors: {
            //         origin: '*',
            //     }
            // });

            /* Listening for a connection from the client. */
            // io.on("connection", (socket) => {
            //     console.log("socket user connected");
            //     this.socket = socket;
            //     socket.on('send-sdn-command', (data) => {
            //         io.emit('sent-sdn-command', data);
            //     });
            //     socket.on('send-frame', (data) => {
            //         io.emit('sent-frame', data);
            //     });
            //     socket.on('sent-communication-log', (data) => {
            //         io.emit('received-communication-log', data);
            //     });
            //     socket.on('resend-command', (data) => {
            //         io.emit('resent-command', data);
            //     });
            //     socket.on('disconnect', () => {
            //         console.log('socket user disconnected');
            //     });
            //     socket.on('error', (err) => {
            //         console.log('socket ERR', err);
            //     });
            // });

            // this.app.use((req, res, next) => {
            //     res.locals.socket = this.socket;
            //     // res.setHeader(
            //     //     'Content-Security-Policy',
            //     //     "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'"
            //     // );
            //     next();
            // });


            /* This is a catch-all route that will be called if no other route is matched. */
            this.app.use(function (req: Request, res: Response) {
                HttpStatus.NotFoundResponse("API not found", res);
            });
        });
    }

    /**
     * "If the port is already in use, increment the port number and try again."
     * @param {http.Server} server - the server object
     * @param {Function} resolve - Promise resolve callback
     * @param {Function} reject - Promise reject callback
     */
    private listen(server: http.Server, resolve?: (port: number) => void, reject?: (error: any) => void) {
        server.listen(port);
        server.once('error', (error: any) => {
            if (error.syscall !== 'listen') {
                if (reject) reject(error);
                else throw error;
                return;
            }
            // detect server crash and restart server

            // handle specific listen errors
            switch (error.code) {
                case 'EADDRINUSE':
                case 'EACCES':
                    console.error(`Port ${port} is already in use`);
                    server.close();
                    ++port;
                    this.listen(server, resolve, reject);
                    break;
                default:
                    if (reject) reject(error);
                    else throw error;
            }
        });
        // process.once('exit', code => {
        //     server.close();
        //     this.listen(server);
        // })
        server.once('listening', () => {
            console.log(`Server is listening on port ${port}`);
            process.env.SOMFY_PORT = port.toString();
            if (resolve) resolve(port);
        });
    }
}

// const serverInstance = new appServer();
// serverInstance.config();