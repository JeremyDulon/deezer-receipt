(function () {
  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  let displayName = 'Deezer Receipt';
  let dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let today = new Date();
  let queryString = window.location.search;
  let urlParams = new URLSearchParams(queryString)
  let userProfileSource = document.getElementById('user-profile-template').innerHTML,
      userProfileTemplate = Handlebars.compile(userProfileSource),
      userProfilePlaceholder = document.getElementById('receipt');

  let access_token = urlParams.get('access_token'),
      error = urlParams.get('error');

  function hiddenClone(element) {
    // Create clone of element
    let clone = element.cloneNode(true);

    // Position element relatively within the
    // body but still out of the viewport
    let style = clone.style;
    style.position = 'relative';
    style.top = window.innerHeight + 'px';
    style.left = 0;
    // Append clone to body and return the clone
    document.body.appendChild(clone);
    return clone;
  }

  if (error) {
    alert('There was an error during the authentication');
  } else {
    if (access_token) {
      $.ajax({
        url: 'https://api.deezer.com/user/me',
        dataType: 'jsonp',
        data: {
          access_token: access_token,
          output: 'jsonp'
        },
        success: function (response) {
          console.log(response)
          displayName = response.name.toUpperCase();
          $('#login').hide();
          $('#loggedin').show();
        },
        error: function (response, error, thrownError) {
          console.log(response)
          console.log(error)
          console.log(thrownError)
        }
      });
    } else {
      // render initial screen
      $('#login').show();
      $('#loggedin').hide();
    }

    document.getElementById('top-tracks').addEventListener(
        'click',
        function () {
          $.ajax({
            url: 'https://api.deezer.com/user/me/charts/tracks',
            dataType: 'jsonp',
            data: {
              access_token: access_token,
              output: 'jsonp'
            },
            success: function (response) {
              var data = {
                trackList: [],
                total: '',
                date: today.toLocaleDateString('en-US', dateOptions).toUpperCase(),
                json: true
              }

              let total = 0
              let tracksData = response.data.slice(0,10)
              let index = 1
              tracksData.forEach(function (val) {
                total += val.duration
                let minutes = Math.floor(val.duration / 60);
                let seconds = (val.duration % 60).toFixed(0);
                data.trackList.push({
                  num: index < 10 ? '0' + index : index,
                  artist: val.artist.name.toUpperCase(),
                  duration: minutes + ':' + (seconds < 10 ? '0' : '') + seconds,
                  title: val.title.toUpperCase()
                })
                index++;
              })
              let totalMinutes = Math.floor(total / 60);
              let totalSeconds = (total % 60).toFixed(0);
              data.total = totalMinutes + ':' + (totalSeconds < 10 ? '0' : '') + totalSeconds;
              userProfilePlaceholder.innerHTML = userProfileTemplate({
                tracks: data.trackList,
                total: data.total,
                time: data.date,
                num: 3,
                name: displayName,
                period: 'FAVORITE TRACKS'
              })

              document.getElementById('download').addEventListener('click', function () {
                let offScreen = document.querySelector('.receiptContainer');
                window.scrollTo(0, 0);
                var clone = hiddenClone(offScreen);
                // Use clone with htm2canvas and delete clone
                html2canvas(clone, { scrollY: -window.scrollY}).then((canvas) => {
                  let dataURL = canvas.toDataURL();
                  console.log(dataURL);
                  let link = document.createElement('a');
                  link.download = 'deezer_tracks.png';
                  link.href = dataURL;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                });
              });
            },
            error: function (response, error, thrownError) {
              console.log(response)
              console.log(error)
              console.log(thrownError)
            }
          })
        },
        false
    )
  }
})();
