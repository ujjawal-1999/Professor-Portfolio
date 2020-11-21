function addbooks(){
    document.getElementById("NewBook").style.opacity="1";
    document.getElementById("NewBook").style.zIndex="5";
}
function editbook(id){
    const editForm = document.getElementsByClassName('editForm')[0];
    editForm.setAttribute('action',`/admin/book/edit/${id}`);
    document.getElementById("EditBook").style.opacity="1";
    document.getElementById("EditBook").style.zIndex="5";
}
function hideModal(modal){
    document.getElementById(modal).style.opacity = "0";
    document.getElementById(modal).style.zIndex = "0";
}