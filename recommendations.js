window.Recommendations = {
  init() {
    const buttons=[...document.querySelectorAll("[data-category]")];
    const cards=[...document.querySelectorAll(".recommend-card")];
    buttons.forEach(btn=>btn.addEventListener("click",()=>{
      buttons.forEach(x=>x.classList.remove("active")); btn.classList.add("active");
      const cat=btn.dataset.category;
      cards.forEach(card=>card.hidden=cat!=="all" && card.dataset.category!==cat);
    }));
  }
};
document.addEventListener("DOMContentLoaded",()=>Recommendations.init());
