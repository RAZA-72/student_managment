// Easy selector helper function
const select = (el, all = false) => {
  el = el.trim();
  if (all) {
    return [...document.querySelectorAll(el)];
  } else {
    return document.querySelector(el);
  }
};

// Easy event listener function
const on = (type, el, listener, all = false) => {
  if (all) {
    select(el, all).forEach(e => e.addEventListener(type, listener));
  } else {
    select(el, all).addEventListener(type, listener);
  }
};

// Sidebar toggle
if (select('.toggle-sidebar-btn')) {
  on('click', '.toggle-sidebar-btn', function (e) {
    select('body').classList.toggle('toggle-sidebar');
  });
}

/*********** jQuery Section **********/
$(document).ready(function () {
  // Initialize DataTables
  $('.datatable').DataTable({
    paging: true,
    searching: true,
    responsive: true
  });

  // Dropdown toggle
  $(".dropdown-toggle").click(function (e) {
    e.preventDefault();
    let dropdownMenu = $(this).next(".dropdown-menu");
    $(".dropdown-menu").not(dropdownMenu).slideUp(300);
    dropdownMenu.slideToggle(300);
  });

  // Close dropdown on outside click
  $(document).click(function (e) {
    if (!$(e.target).closest(".dropdown").length) {
      $(".dropdown-menu").slideUp(300);
    }
  });

  // Select2 dropdown
  $('.searchableDropdown').select2({
    placeholder: "Select an option",
    allowClear: true
  });

  // Re-validate select2 on change safely
  $('.searchableDropdown').on('change', function () {
    const form = $(this).closest('form');
    if (form.length && form.data('validator')) {
      form.validate().element(this);
    }
  });

  // Auto-generate Audit ID
  $(document).on('change', '#audit_year', function () {
    var year = $(this).val();
    var establishmentid = $("#establishment").val();
    $('#Auditid').val(establishmentid + '-' + year);
  });

  // jQuery Validation
  $("#schedular").validate({
    rules: {
      organization: "required",
      establishment: "required",
      audit_year: "required",
      audit_date: "required",
      assign_num: "required"
    },
    messages: {
      organization: "Please select Organization",
      establishment: "Please select Establishment",
      audit_year: "Please select audit year",
      audit_date: "Please select audit date",
      assign_num: "This field is required"
    },
    errorClass: "error",
    validClass: "success-label",
    errorPlacement: function (error, element) {
      if (element.hasClass("select2-hidden-accessible")) {
        error.insertAfter(element.next('.select2')); // place after select2 container
      } else {
        error.insertAfter(element);
      }
    },
    success: function (label) {
      label.remove(); // hides success labels completely
    }
  });

  // Month-Year Datepicker
  $('#monthYearPicker, #monthYearPicker1').datepicker({
    changeMonth: true,
    changeYear: true,
    showButtonPanel: true,
    dateFormat: 'MM/yy',
    onClose: function (dateText, inst) {
      var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
      var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
      $(this).datepicker('setDate', new Date(year, month, 1));
    },
    beforeShow: function (input, inst) {
      $(input).datepicker("widget").addClass("hide-calendar");
      setTimeout(function () {
        $("#ui-datepicker-div .ui-datepicker-buttonpane .ui-datepicker-current").hide();
      }, 1);
    }
  });

  // File size validation (max 500KB)
  if ($("#formFile").length) {
    $("#formFile").on('change', function () {
      const file = this.files[0];
      if (file) {
        const maxSize = 500 * 1024;
        if (file.size > maxSize) {
          $("#fileError").text("Image should be less than 500KB, this image will not update, use image less than 500KB.");
          $(this).val('');
        } else {
          $("#fileError").text('');
        }
      } else {
        $("#fileError").text('');
      }
    });
  }
});

// AOS Animation Initialization
AOS.init();
