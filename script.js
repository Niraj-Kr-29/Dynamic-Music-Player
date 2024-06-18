let currentSong = new Audio();
let songs;
let currFolder;
let currentSongIndex = 0;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
    currFolder = folder
    let a = await fetch(`https://github.com/Niraj-Kr-29/Project-Music-Player-/tree/main/songs/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
     for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
     }
    //  console.log(songs)
     //Show all songs in library
      let songUL = document.querySelector(".songContainer").getElementsByTagName("ul")[0]
      songUL.innerHTML = ""
      for (const song of songs) {
          songUL.innerHTML = songUL.innerHTML + `<li class="flex listElement">
          <div class="flex listImg"><img src="/img/songList.svg" alt=""></div>
          <div class="songInfo" style="width : 230px">
          <div style="font-size: 12px;padding:0px 15px"> ${song.replaceAll("%20", " ").replace(".mp3","")}</div>
          </div>
          <div class="songListPlay flex">
          <p class="playNow" style="width : 52px" >Play Now</p>
          <img class="listPlayButton" src="img/playButton.svg" alt="">
          </div>
          </li>`;
      }

      //Attach an event listener to each song
      Array.from(document.querySelector(".songContainer").getElementsByTagName("li")).forEach(e=>{
          e.addEventListener("click", element=>{
              let track = e.querySelector(".songInfo").firstElementChild.innerHTML.trim() + ".mp3"
              track = encodeURIComponent(track); /**  Encode the track name correctly, It is necessary because 
                                                    the "songs" object are having encoded names of songs*/
              currentSongIndex = songs.indexOf(track);
              console.log('Clicked track:', track);  // Log the clicked track for debugging
              console.log('Current song index:', currentSongIndex);  // Log the current song index for debugging
              playMusic(track)
          })
      })

      return songs
}




function playMusic (track,pause=false){
    // let audio = new Audio("/songs/"+track)
    currentSong.src = `https://github.com/Niraj-Kr-29/Project-Music-Player-/tree/main/songs/${currFolder}/`+ track
    if(!pause){
        currentSong.play()
    document.querySelector("#play").src = "img/pause.svg"
    }
    document.querySelector(".controlBarSong").innerHTML = decodeURIComponent(track)
    document.querySelector(".songDuration").innerHTML = "00:00 / 00:00"
    //to change list style while playing
        //resetting the style of all the other list items
    
    let songBundle = Array.from(document.querySelector(".songContainer").getElementsByTagName("li"))    

    songBundle.forEach(li=>{
        li.querySelector(".playNow").innerHTML = "Play Now"
        li.querySelector(".playNow").style.color = "white"
        li.querySelector(".listPlayButton").src="img/playButton.svg"
    })
    // changing the syle of list item that has been clicked
    songBundle[currentSongIndex].querySelector(".listPlayButton").src = "img/playingMusic.gif"
    songBundle[currentSongIndex].querySelector(".listPlayButton").style.height = "24px"
    songBundle[currentSongIndex].querySelector(".playNow").innerHTML = "Playing..."
    songBundle[currentSongIndex].querySelector(".playNow").style.color = "#24cfa5"
}


//Function to display albums
async function displayAlbums(){
    let a = await fetch(`https://github.com/Niraj-Kr-29/Project-Music-Player-/tree/main/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    let cardContainer = document.querySelector(".cardContainer")
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs/") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/")[4]
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="playButton">
                            <img src="img/playlistPlay.svg" alt="">
                        </div>
                        <div class="cardImageDiv" style="background-image:url(songs/${folder}/cover.jpg)">
                        </div>
                        <h2>${folder}</h2>
                    </div>`
        }
        
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`) 
            songBundle.forEach(li=>{
                li.querySelector(".playNow").innerHTML = "Play Now"
                li.querySelector(".playNow").style.color = "white"
                li.querySelector(".listPlayButton").src="img/playButton.svg"
            })

        })
    })
}

async function main(){
    // Get the list of all the songs
    songs = await getSongs("Alan_Walker")
    playMusic(songs[0].replaceAll("%20", " ").trim(),true)
    
    // Display all the albums on the page
    await displayAlbums()
    
    const songBundle = Array.from(document.querySelector(".songContainer").getElementsByTagName("li"))





    //Attach an event listener to play, next and previous
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play()
            document.querySelector("#play").src = "img/pause.svg"
            
        }
        else{
            currentSong.pause()
            document.querySelector("#play").src = "img/controlsPlay.svg"
        }
    })

    next.addEventListener("click", ()=>{
        currentSongIndex = (currentSongIndex + 1) % songs.length; // Move to the next song
        playMusic(songs[currentSongIndex].replaceAll("%20", " ").trim());
    });
    
    previous.addEventListener("click", ()=>{
        currentSongIndex = (currentSongIndex - 1) % songs.length; // Move to the next song
        playMusic(songs[currentSongIndex].replaceAll("%20", " ").trim());
    });


    //Listen for timeupdate
    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songDuration").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = `${currentSong.currentTime/currentSong.duration*100}%`
    })
    
    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })
    // Add an event listener to play the next song when the current song ends
    currentSong.addEventListener("ended", () => {
        currentSongIndex = (currentSongIndex + 1) % songs.length; // Move to the next song
        playMusic(songs[currentSongIndex].replaceAll("%20", " ").trim());
    });

    //Add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click",e => {
        document.querySelector(".left").style.left = "0%"
    })
    
    //Add an event listener to close
    document.querySelector(".close").addEventListener("click",e => {
        document.querySelector(".left").style.left = "-130%"
    })

    //Add an event listener to volume
    document.querySelector(".volumeRange").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })


}

main()