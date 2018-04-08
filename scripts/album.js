var setSong = function(songNumber) {
  if(currentSoundFile) {
    currentSoundFile.stop();
  }
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];

    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
      formats: ['mp3'],
      preload: true
    });

    setVolume(currentVolume);
};

var seek = function(time) {
  if(currentSoundFile) {
    currentSoundFile.setTime(time);
  }
}

var setVolume = function(volume) {
  if(currentSoundFile){
    currentSoundFile.setVolume(volume);
  }
};

var getSongNumberCell = function(number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
};

var createSongRow = function(songNumber, songName, songLength) {
  var template =
      '<tr class="album-view-song-item">'
      +'<td class="song-item-number" data-song-number="'+ songNumber +'">' + songNumber + '</td>'
      +'<td class="song-item-title">' + songName + '</td>'
      +'<td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
      +'</tr>'
      ;

      var $row = $(template);

      var clickHandler = function() {
        var songNumber = parseInt($(this).attr('data-song-number'));

        if(currentlyPlayingSongNumber !== null) {
          var currentlyPlayingCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
          currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }
        if(currentlyPlayingSongNumber !== songNumber) {
          $(this).html(pauseButtonTemplate);
          setSong(songNumber);
          currentSoundFile.play();
          var $volumeFill = $('.volume .fill');
          var $volumeThumb = $('.volume .thumb');
          $volumeFill.width(currentVolume + '%');
          $volumeThumb.css({left: currentVolume + '%'});
          updateSeekBarWhileSongPlays();
          updatePlayerBarSong();

        } else if(currentlyPlayingSongNumber === songNumber) {
          if(currentSoundFile.isPaused()) {
            $(this).html(pauseButtonTemplate);
            $('.main-controls .play-pause').html(playerBarPauseButton);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
          } else {
            $(this).html(playButtonTemplate);
            $('.main-controls .play-pause').html(playerBarPlayButton);
            currentSoundFile.pause();
          }
        }
      };

      var onHover = function(event){
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));

        if(songNumber !== currentlyPlayingSongNumber) {
          songNumberCell.html(playButtonTemplate);
        }
      };

      var offHover = function(event){
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));

        if(songNumber !== currentlyPlayingSongNumber) {
          songNumberCell.html(songNumber);
        }
      };

      $row.find('.song-item-number').click(clickHandler);
      $row.hover(onHover, offHover);

      return $row;
};

var setCurrentAlbum = function(album) {

  currentAlbum = album;

  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);

  $albumSongList.empty();

     for (var i = 0; i < album.songs.length; i++) {
         var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
         $albumSongList.append($newRow);
     }
};

var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
};

var nextSong = function() {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _incrementing_ the song here
    currentSongIndex++;

    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }

    // Save the last song number before changing it
    var lastSongNumber = currentlyPlayingSongNumber;

    // Set a new current song
    currentlyPlayingSongNumber = currentSongIndex + 1;
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();

    // Update the Player Bar information
    updatePlayerBarSong();

    var $nextSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};

var previousSong = function() {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _decrementing_ the index here
    currentSongIndex--;

    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }

    // Save the last song number before changing it
    var lastSongNumber = currentlyPlayingSongNumber;

    // Set a new current song
    currentlyPlayingSongNumber = currentSongIndex + 1;
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();

    // Update the Player Bar information
    updatePlayerBarSong();

    $('.main-controls .play-pause').html(playerBarPauseButton);

    var $previousSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};

var togglePlayFromPlayerBar = function () {
  if (currentSoundFile) {
    currentSoundFile.togglePlay();

    if (currentSoundFile.isPaused()) {
      $('.main-controls .play-pause').html(playerBarPlayButton);
      $getSongNumberCell(currentlyPlayingSongNumber).html($playButtonTemplate);
    } else if (!currentSoundFile.isPaused()) {
      $('.main-controls .play-pause').html(playerBarPauseButton);
      $getSongNumberCell(currentlyPlayingSongNumber).html($pauseButtonTemplate);
    }
  }
};

var updatePlayerBarSong = function () {

  var setTotalTimeInPlayerBar = function(totalTime){
    $('.total-time').text(filterTimeCode(totalTime));
  };

  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);

  $('.main-controls .play-pause').html(playerBarPauseButton);

  setTotalTimeInPlayerBar(currentSongFromAlbum.duration);
};

var updateSeekBarWhileSongPlays = function() {

  var setCurrentTimeInPlayerBar = function(currentTime){
    var $timeDiv = $('.current-time');
    $timeDiv.text(filterTimeCode(currentTime));
  }
  if(currentSoundFile) {
    currentSoundFile.bind('timeupdate', function(event){
      var seekBarFillRatio = this.getTime() / this.getDuration();
      var $seekBar = $('.seek-control .seek-bar');
      setCurrentTimeInPlayerBar(this.getTime());
      updateSeekPercentage($seekBar, seekBarFillRatio);
    });
  }
};

var filterTimeCode = function(timeInSeconds) {
  var minutes = parseFloat(Math.floor(timeInSeconds / 60));
  var seconds = ("0" + Math.floor(timeInSeconds % 60)).slice(-2);
  return minutes + ':' + seconds;
}

var updateSeekPercentage = function($seekBar, seekBarFillRatio){
  var offsetXPercent = seekBarFillRatio * 100;

  offsetXPercent = Math.max(0, offsetXPercent);

  offsetXPercent = Math.min(100, offsetXPercent);

  var percentageString = offsetXPercent + '%';

  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
  var $seekBars = $('.player-bar .seek-bar');

  $seekBars.click(function(event) {
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();
    var seekBarFillRatio = offsetX / barWidth;

    if ($(this).parent().attr('class') == 'seek-control') {
      seek(seekBarFillRatio * currentSoundFile.getDuration());
    } else {
      setVolume(seekBarFillRatio * 100);
    }

    updateSeekPercentage($(this), seekBarFillRatio);
  });

  $seekBars.find('.thumb').mousedown(function(event){
    var $seekBar = $(this).parent();

    $(document).bind('mousemove.thumb', function(event){
      var offsetX = event.pageX - $seekBar.offset().left;
      var barWidth = $seekBar.width();
      var seekBarFillRatio = offsetX / barWidth;

      if ($seekBar.parent().attr('class') == 'seek-control') {
        seek(seekBarFillRatio * currentSoundFile.getDuration());
      } else {
        setVolume(seekBarFillRatio);
      }

      updateSeekPercentage($seekBar, seekBarFillRatio);
    });

    $(document).bind('mouseup.thumb', function(){
      $(document).unbind('mousemove.thumb');
      $(document).unbind('mouseup.thumb');
    });
  });
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';

var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';

var playerBarPlayButton = '<span class="ion-play"></span>';

var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;

var currentlyPlayingSongNumber = null;

var currentSongFromAlbum = null;

var currentSoundFile = null;

var currentVolume = 80;

var $previousButton = $('.main-controls .previous');

var $nextButton = $('.main-controls .next');

var $playPauseButton = $('.main-controls .play-pause');

$(document).ready(function() {
     setCurrentAlbum(albumPicasso);
     setupSeekBars();
     $previousButton.click(previousSong);
     $nextButton.click(nextSong);
     $playPauseButton.click(togglePlayFromPlayerBar);
});
