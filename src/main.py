import eventlet
import socketio
sio = socketio.Server()
app = socketio.WSGIApp(sio, static_files={
    '/': '../../starkingdoms-client/',
    })

@sio.event
def connect(sid, environ, auth):
    print('connect ', sid)

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 8080)), app)
