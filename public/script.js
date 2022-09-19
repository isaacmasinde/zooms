const socket = io('/')
let displayMediaStream
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port:'5000',
	config: {'iceServers': [
        { url: 'stun:stun.l.google.com:19302' },
      ]}
})

const myVideo = document.createElement('video')
myVideo.muted=true
let calls = [];
const peers ={}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio:false
}).then( stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call  => {
        call.answer(stream)
        video = document.createElement('video')
        call.on('stream', UserVideoStream => {
            addVideoStream(video, UserVideoStream)
        })
        console.log(call.peer)
        peers[call.peer] = call
        calls.push(call)
    })
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
        console.log(peers)
    })

    document.getElementById('sharescreen').addEventListener('click', async () => {
        if (!displayMediaStream) {
          displayMediaStream = await navigator.mediaDevices.getDisplayMedia();
        }
        console.log(calls);
        calls.forEach((call) => {
            console.log("got here")
            const sender = call.peerConnection.getSenders().find((s) => s.track.kind === 'video');
            console.log('Found sender:', sender);
            sender.replaceTrack(displayMediaStream.getVideoTracks()[0]);
        });

        
        //show what you are showing in your "self-view" video.
        myVideo.srcObject = displayMediaStream;
        

      });
      stream.getVideoTracks()[0].onended = function () {
        console.log(calls);
        calls.forEach((call) => {
            console.log("got here")
            const sender = call.peerConnection.getSenders().find((s) => s.track.kind === 'video');
            console.log('Found sender:', sender);
            sender.replaceTrack(stream.getVideoTracks()[0]);
        });

        
        //show what you are showing in your "self-view" video.
        myVideo.srcObject = stream;
      };
    document.getElementById("mutecam").addEventListener("click", 
    function () {
        const videoTrack = stream.getTracks().find(track => track.kind == 'video');
        if (videoTrack.enabled){
            videoTrack.enabled = false;
        }
        else{
            videoTrack.enabled = true;
        }
    }
    );

    document.getElementById("mutemic").addEventListener("click", 
    function () {
        const audioTrack = stream.getTracks().find(track => track.kind == 'audio');
        if (audioTrack.enabled){
            audioTrack.enabled = false;
        }
        else{
            audioTrack.enabled = true;
        }
    }
    );
    
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
    calls.push(call)
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