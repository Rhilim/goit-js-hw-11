import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

import { galleryMarkup } from './markup';
import { refs } from './refs';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38147369-b2ddcbff8805f9127b2360eeb';

let pageCounter = 1;
let pagesCount = 1;
let inputValue = '';
let perPage = 40;

const options = {
  timeout: 3000,
};

const lightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 100,
});

// refs.formInputRef.addEventListener('keydown', e => {
//   if (refs.formBtnRef.hasAttribute('disabled') && e.code === 'Space') {
//     e.target.value = '';
//     return Notiflix.Notify.failure(
//       `Sorry, but don't start with '${e.code}'-key and enter valid word! ;)`
//     );
//   }
// });
refs.formBtnRef.disabled = true;

refs.formInputRef.addEventListener('input', async e => {
  const inputEl = e.target.value.trim();
  if (inputEl.length === 0) {
    refs.formBtnRef.disabled = true;
    refs.formBtnRef.style.cursor = 'not-allowed';
    Notiflix.Notify.failure(
      `Sorry, but don't start with empty space, please enter a valid word! ;)`
    );
  } else if (inputEl.length > 0) {
    refs.formBtnRef.disabled = false;
    refs.formBtnRef.style.cursor = 'pointer';
  }
  return;
});

const getImages = async value => {
  const imageThumb = await axios.get(`${BASE_URL}`, {
    params: {
      key: API_KEY,
      q: value,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: pageCounter,
      per_page: perPage,
    },
  });

  return imageThumb;
};

refs.formRef.addEventListener('submit', async e => {
  e.preventDefault();

  refs.galleryRef.innerHTML = '';
  pageCounter = 1;
  inputValue = refs.formInputRef.value.trim();

  await getImages(inputValue)
    .then(res => {
      const { hits, totalHits } = res.data;
      pagesCount = Math.ceil(totalHits / perPage);
      if (hits.length === 0) {
        refs.galleryRef.innerHTML = '';
        return Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
          options
        );
      } else if (pagesCount === pageCounter) {
        refs.galleryRef.innerHTML = '';
        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
        refs.galleryRef.innerHTML = galleryMarkup(hits);
        refs.loadMoreBtnRef.classlist.remove('is-hidden');
        
        lightBox.refresh();
        
        return Notiflix.Notify.failure(
          `We're sorry, but you've reached the end of search results.`,
          options
        );
      }

      refs.galleryRef.innerHTML = galleryMarkup(hits);
      refs.loadMoreBtnRef.classList.remove('is-hidden');
      lightBox.refresh();
      
      return Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);

    })
    .catch(error => {
      console.log(error.code);

      return Notiflix.Notify.failure(
        'Oops, something went wrong! ' + `Error is ${error.message}`
      );
    });
});



const handleLoadMoreBtnClick = async () => { 
  pageCounter += 1;
  console.log(pageCounter);

await getImages(inputValue)
    .then(res => {
      const { hits, totalHits } = res.data;
      pagesCount = Math.ceil(totalHits / perPage);
      if (pagesCount === pageCounter) {
        refs.loadMoreBtnRef.classList.add('is-hidden');
      }
      refs.galleryRef.insertAdjacentHTML('beforeend', galleryMarkup(hits));
    })
    .catch(
      Notiflix.Notify.failure(
        'Oops, something went wrong! ' + `Error is ${error.message}`
      )
    );
}
refs.loadMoreBtnRef.addEventListener('click', handleLoadMoreBtnClick);

