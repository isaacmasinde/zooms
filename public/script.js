const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port:'5000'
})

const myVideo = document.createElement('video')
myVideo.muted=true

const peers ={}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio:true
}).then( stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call  => {
        call.answer(stream)
        video = document.createElement('video')
        
        call.on('stream', UserVideoStream => {
            addVideoStream(video, UserVideoStream)
        })
    })
    socket.on('user-connected', userId => {
        console.log('New user connected 5')
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})
myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
}) 
function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream)
    video = document.createElement('video')
    
    call.on('stream', UserVideoStream => {
        addVideoStream(video, UserVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}
function addVideoStream(video, stream){
    video.srcObject = stream
    video.classList.add("card");
    video.classList.add("card-body")
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}