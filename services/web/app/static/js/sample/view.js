/*
Copyright (C) 2020 Keiron O'Shea <keo7@aber.ac.uk>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

function get_sample() {
    var api_url = encodeURI(window.location + '/data');

    var json = (function () {
        var json = null;
        $.ajax({
            'async': false,
            'global': false,
            'url': api_url,
            'dataType': "json",
            'success': function (data) {
                json = data;
            },
            'failure': function (data) {
                json = data;
            }
            
        });
        return json;
    })();

    return json;
   

}



function get_barcode(sample_info, barc_type) {

    var url = encodeURI(sample_info["_links"]["barcode_generation"]);

    $.post({
        async: false,
        global: false,
        url: url,
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify({
            "type": barc_type,
            "data": sample_info["uuid"]
        }),
        success: function (data) {
            $("#barcode").attr("src", "data:image/png;base64," + data["b64"]);
        },

    });



}

function get_rack() {
    //var api_url = encodeURI(window.location + '/data');
    var current_url = encodeURI(window.location);
    var split_url = current_url.split("/");
    console.log('url: ', split_url)
    split_url.pop()
    split_url.pop()
    split_url.push('storage', 'rack')
    var api_url = split_url.join("/") + "/info"
    //rack_index
    console.log('url: ', api_url)

    var json = (function () {
        var json = null;
        $.ajax({
            'async': false,
            'global': false,
            'url': api_url,
            'dataType': "json",
            'success': function (data) {
                json = data;
            },
            'failure': function (data) {
                json = data;
            }

        });
    console.log('json', json)
        return json;
    })();

    return json;

}



function fill_title(sample) {

    var author_information = sample["author"];
    var title_html = render_colour(sample["colour"]);
    title_html += sample["uuid"]
    $("#uuid").html(title_html);
    var author_html = "" + author_information["first_name"] + " " + author_information["last_name"]
    $("#created_by").html(author_html);
    $("#created_on").html(sample["created_on"]);

    if (sample["source"] != "New") {
        var parent_html = '';
        parent_html += '<a href="' + sample["parent"]["_links"]["self"] + '" target="_blank">'
        parent_html += '<i class="fas fa-vial"></i> ';
        parent_html += sample["parent"]["uuid"]
        parent_html += '</a>'
        $("#parent").html(parent_html);
        $("#parent-div").show();
    }


}

function fill_comments(comments) {
    if (comments == "") {
        var comments = "No comments available";
    }
    $("#comments").text(comments);
}


function fill_consent_information(consent_information) {

    $("#consent_name").html(consent_information["template"]["name"]);
    $("#consent_version").html(consent_information["template"]["version"]);
    $("#consent_identifier").html(consent_information["identifier"]);
    $("#consent_comments").html(consent_information["comments"]);


    for (answer in consent_information["answers"]) {
        var answer_info = consent_information["answers"][answer];

        var answer_html = '';
        answer_html += '<li class="list-group-item flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h5 class="mb-1">Answer ';
        answer_html += + (parseInt(answer) + 1) + '<h5></div><p class="mb-1">' + answer_info["question"] + '</p></li>';

        $("#questionnaire-list").append(answer_html);
    }

    $("#consent_date").html(consent_information);


}

function fill_custom_attributes(custom_attributes) {

    var html = "";

    for (i in custom_attributes) {
        var attribute = custom_attributes[i];

        var label = attribute["attribute"]["term"];

        if (attribute["option"] == null) {
            var content = attribute["data"];
        }

        else {
            var content = attribute["option"]["term"];

        }

        html += render_content(label, content);
    }

    $("#custom-attributes-table").html(html);
}

function fill_basic_information(sample_information) {
    var html = "";

    if (sample_information["base_type"] == "Fluid") {
        var measurement = "mL";
        var sample_type = sample_information["sample_type_information"]["fluid_type"];
    }

    else if (sample_information["base_type"] == "Molecular") {
        var measurement = "μg/mL";
        var sample_type = sample_information["sample_type_information"]["molecular_type"];

    }

    else {
        var measurement = "Cells";
        var sample_type = sample_information["sample_type_information"]["cellular_type"];
    }

    html += render_content("Status", sample_information["status"]);
    html += render_content("Biobank Barcode", sample_information["barcode"]);
    html += render_content("Biohazard Level", sample_information["biohazard_level"]);
    html += render_content("Type", sample_information["base_type"]);
    html += render_content("Sample Type", sample_type);


    html += render_content("Quantity", sample_information["remaining_quantity"] + " / " + sample_information["quantity"] + " " + measurement);

    $("#basic-information").html(html);
}


function fill_document_information(document_information) {
        $("#documentTable").DataTable({
            data: document_information,
            pageLength: 5,
            columns: [
                {
                    mData: {},
                    mRender: function (data, type, row) {

                        document_data = "<a href='" + data["_links"]["self"] + "'>";
                        document_data += '<i class="fas fa-file"></i> LIMBDOC-'
                        document_data += data["id"] + ": "
                        document_data += data["name"] + "</a>"
                        return document_data
                    }
                },
                {
                    mData: {},
                    mRender: function (data, type, row) {
                        return data["type"]
                    }
                }

            ]
        });



}

function fill_sample_reviews(reviews) {
    for (r in reviews) {
        var review_info = reviews[r];
        // Start ul
        var event_datetime = '';
        var undertaken_by = '';
        var comments = '';
        if (review_info["event"] != null || review_info["event"] != undefined) {
            if (review_info["event"].hasOwnProperty('datetime')) {
                event_datetime = review_info["event"]["datetime"];
            }
            if (review_info["event"].hasOwnProperty('undertaken_by')) {
                undertaken_by = review_info["event"]["undertaken_by"];
            }
            if (review_info["event"].hasOwnProperty('comments')) {
                comments = review_info["event"]["datetime"];
            }
        }
        html = "<li>"
        //html += "<p class='text-muted'>Undertaken on " + review_info["event"]["datetime"] + "</p>"
        html += "<p class='text-muted'>Undertaken on " + event_datetime + "</p>"

        // Start card body
        html += "<div class='card'>"

        var header_colour = "text-white bg-warning"
        var glyphicon = "fa fa-star";

        if (review_info["result"] == "Pass") {
            var header_colour = "text-white bg-success";
            var glyphicon = "fa fa-check-circle"
        }

        else if (review_info["result"] == "Fail") {
            var header_colour = "text-white bg-danger";
            var glyphicon = "fa fa-times-circle"
        }


        html += "<div class='card-header "+header_colour+"'>"
        html += review_info["review_type"];
        html += "</div>";
        html += "<div class=' card-body'>"
        html += "<div class='media'>"
        html += "<div class='align-self-center mr-3'>"
        html += "<h1><i class='"+ glyphicon + "'></i></h1>"
        html += "</div>"
        html += "<div class='media-body'>"
        html += "<h5 class='mt-0'>" + review_info["uuid"] + "</h5>";
        html += "<table class='table table-striped'>"
        html += render_content("Quality", review_info["quality"]);
        html += render_content("Conducted By", undertaken_by); //, review_info["event"]["undertaken_by"]);
        html += render_content("Comments", comments); //review_info["event"]["comments"]);
        html += "</table>"
        html += "</div>"

        html += "</div>"
        // End card body
        html += "</div>"
        html += "<div class='card-footer'>"
        //html += "<a href='" + review_info["_links"]["edit"] + "'>"
        html += "<div class='btn btn-warning float-left'>Edit</div>"
        //html += "</a>"
        html += "<div class='btn btn-danger float-right disabled'>Remove</div>"
        html += "</div>"
        html += "</div>"

        // End ul
        html += "</li>"

        $("#sample-review-li").append(html);
    }
}


function fill_protocol_events(events) {

    let protocol_events = new Map();


    for (e in events) {
        var event_info = events[e];

        var event_datetime = '';
        var undertaken_by = '';
        var comments = '';
        if (event_info["event"] != null || event_info["event"] != undefined) {
            if (event_info["event"].hasOwnProperty('datetime')) {
                event_datetime = event_info["event"]["datetime"];
            }
            if (event_info["event"].hasOwnProperty('undertaken_by')) {
                undertaken_by = event_info["event"]["undertaken_by"];
            }
            if (event_info["event"].hasOwnProperty('comments')) {
                comments = event_info["event"]["datetime"];
            }
        }
        // Start ul
        html = "<li>"
        //html += "<p class='text-muted'>Undertaken on " + event_info["event"]["datetime"] + "</p>"
        html += "<p class='text-muted'>Undertaken on " + event_datetime + "</p>"
        // Start card body
        html += "<div class='card'>"
        html += "<div class='card-header'>"
        html += event_info["protocol"]["type"];
        html += "</div>";
        html += "<div class=' card-body'>"
        html += "<div class='media'>"
        html += "<div class='align-self-center mr-3'>"
        html += "<h1><i class='fa fa-project-diagram'></i></h1>"
        html += "</div>"
        html += "<div class='media-body'>"
        html += "<h5 class='mt-0' id='protocol-uuid-" + event_info["id"] +"'>" + event_info["uuid"] + "</h5>";
        html += "<a href='"+ event_info["protocol"]["_links"]["self"] +"'>"
        html += "<h6 class='mt-0'>LIMBPRO-" + event_info["protocol"]["id"] + ": " + event_info["protocol"]["name"] + "</h6>";
        html += "</a>"
        html += "<table class='table table-striped'>"
        html += render_content("Undertaken By", undertaken_by); //event_info["event"]["undertaken_by"]);
        html += render_content("Comments", comments); //event_info["event"]["comments"]);
        html += "</table>"
        html += "</div>"


        html += "</div>"
        // End card body
        html += "</div>"
        html += "<div class='card-footer'>"
        html += "<a href='" + event_info["_links"]["edit"] + "'>"
        html += "<div class='btn btn-warning float-left'>Edit</div>"
        html += "</a>"

        html += "<div id='remove-protocol-"+event_info["id"] + "' class='btn btn-danger float-right'>Remove</div>"
        html += "</div>"
        html += "</div>"

        
        protocol_events.set(event_info["id"].toString(), event_info);
        
        // End ul
        html += "</li>"
        $("#protocol-event-li").append(html);

        $("#remove-protocol-"+event_info["id"]).on("click", function () {
            var id = $(this).attr("id").split("-")[2];
            
            var uuid = $("#protocol-uuid-"+id).text();
            $("#delete-protocol-confirm-modal").modal({
                show: true
            });

            var removal_link = protocol_events.get(id)["_links"]["remove"];

            $("#protocol-uuid-remove-confirmation-input").on("change", function() {
                var user_entry = $(this).val();
                if (user_entry == uuid) {
                    $("#protocol-remove-confirm-button").prop("disabled", false);
                    $('#protocol-remove-confirm-button').click(function() {
                        window.location.href = removal_link;
                    });
                } 
                else {
                    $("#protocol-remove-confirm-button").prop("disabled", true);

                }
            })
        });


    }
}


function fill_lineage_table(subsamples) {
    var rack_info = get_rack();
    if (rack_info["success"] == false) {
        console.log('No rack data')
    }  else {
        var rack_info = rack_info["content"];
    }

    console.table('rack: ', rack_info)

    let table = $('#subSampleTable').DataTable({
        data: subsamples,

        //lengthMenu: [ [5, 10, 25, 50, -1], [5, 10, 25, 50, "All"] ],
        pageLength: 5,
        dom: 'Bfrtip',
        buttons: ['print', 'csv', 'colvis','selectAll', 'selectNone'],

        columnDefs: [
            {targets: '_all', defaultContent: ''},
            {targets: [2, 3, 4], visible: false, "defaultContent": ""},
            {
                targets:  -1,
                 orderable: false,
                 className: 'select-checkbox',
            }

        ],
        order: [[1, 'desc']],
        select: {'style': 'multi',
                'selector': 'td:last-child'},

        columns: [

            {
                "mData": {},
                "mRender": function (data, type, row) {
                    var col_data = '';
                    col_data += render_colour(data["colour"])
                    col_data += "<a href='" + data["_links"]["self"] + "'>";
                    col_data += '<i class="fas fa-vial"></i> '
                    col_data += data["uuid"];
                    col_data += "</a>";
                    if (data["source"] != "New") {

                        col_data += '</br><small class="text-muted"><i class="fa fa-directions"></i> ';
                        col_data += '<a href="' + data["parent"]["_links"]["self"] + '" target="_blank">'
                        col_data += '<i class="fas fa-vial"></i> ';
                        col_data += data["parent"]["uuid"],
                            col_data += "</a></small>";
                    }

                    return col_data
                }
            },
            {data: "id"},
            {data: "barcode"},
            {data: "status"},

            {data: "base_type"},
            {
                "mData": {},
                "mRender": function (data, type, row) {
                    var sample_type_information = data["sample_type_information"];

                    if (data["base_type"] == "Fluid") {
                        return sample_type_information["fluid_type"];
                    } else if (data["base_type"] == "Cell") {
                        return sample_type_information["cellular_type"] + " > " + sample_type_information["tissue_type"];
                    } else if (data["base_type"] == "Molecular") {
                        return sample_type_information["molecular_type"];
                    }

                }
            },
            {
                "mData": {},
                "mRender": function (data, type, row) {
                    var sample_type_information = data["sample_type_information"];

                    if (sample_type_information["cellular_container"] == null) {
                        return sample_type_information["fluid_container"];
                    } else {
                        return sample_type_information["cellular_container"];
                    }

                }
            },
            {
                "mData": {},
                "mRender": function (data, type, row) {
                    var percentage = data["remaining_quantity"] / data["quantity"] * 100 + "%"
                    var col_data = '';
                    col_data += '<span data-toggle="tooltip" data-placement="top" title="' + percentage + ' Available">';
                    col_data += data["remaining_quantity"] + "/" + data["quantity"] + get_metric(data["base_type"]);
                    col_data += '</span>';
                    return col_data
                }
            },
            {
                "mData": {},
                "mRender": function (data, type, row) {
                    var storage_data = data["storage"];

                    if (storage_data == null) {
                        return "<span class='text-muted'>Not stored.</span>"
                    } else if (storage_data["storage_type"] == "STB") {
                        var rack_info = storage_data["rack"];
                        var html = "<a href='" + rack_info["_links"]["self"] + "'>";
                        html += "<i class='fa fa-grip-vertical'></i> LIMBRACK-" + rack_info["id"];
                        html += "</a>"
                        return html
                    } else if (storage_data["storage_type"] == "STS") {
                        var shelf_info = storage_data["shelf"];
                        var html = "<a href='" + shelf_info["_links"]["self"] + "'>";
                        html += "<i class='fa fa-bars'></i> LIMBSHF-" + shelf_info["id"];
                        html += "</a>"
                        return html
                    }
                    return data["storage"]
                }
            },

            {
                "mData": {},
                "mRender": function (data, type, row) {
                    return data["created_on"];
                }
            },

            {} //checkbox select column

        ],

    });


    $.each(rack_info, function(index, r) {
        var optval = '<option value='+ r['id'] + '>'
        optval += 'LIMBRACK'+r['id'] + " ("+ r['num_rows']+'x'+r['num_cols'] + ", "+ r['serial_number']+') @'
        optval += r['location']
        optval += '</option>'
        $("#select_rack").append(optval);
        //$("#select_rack").append('<option value=xx >optval</option>');
    })


    $("#submit").click(function (e) {
        var rows_selected = table.rows( { selected: true } ).data();
        console.log('rows_selected', rows_selected)

        // Iterate over all selected checkboxes
        console.log('rows_selected.length: ', rows_selected.length)
        if (rows_selected.length>0) {
           // get rack info
           var rack_id = $('select[id="select_rack"]').val();
           var shelf_id = $('select[id="select_shelf"]').val();

           //#("id option:selected").val()
           console.log('selected rack: ', rack_id)
           if (rack_id==0 & shelf_id==0) {
               alert('Select a rack or a shelf to store the sample(s)! ');
               return false

           }

           $.each(rows_selected, function (index, row) {
                console.log('index: ', index)//, ', dbID: ', rowData)
                console.log('dbID: ', row['id'])
           });

        }

    });
}


function fill_quantity_chart(type, quantity, remaining_quantity) {

    var metric = get_metric(type);

    new Chart(document.getElementById("quantity-chart"), {
        type: 'doughnut',
        data: {
            labels: ["Remaining " + metric, "Used " + metric],
            datasets: [
                {
                    backgroundColor: ["#28a745", "#dc3545"],
                    data: [remaining_quantity, quantity - remaining_quantity]
                }
            ]
        },
        options: {
            legend: {
                display: false
            }
        }
    }
    );
}

function deactivate_nav() {
    $("#basic-info-nav").removeClass("active");
    $("#protocol-events-nav").removeClass("active");
    $("#associated-documents-nav").removeClass("active");
    $("#sample-review-nav").removeClass("active");
    $("#lineage-nav").removeClass("active");
    $("#custom-attr-nav").removeClass("active");
}

function hide_all() {
    var tim = 50;
    $("#basic-info").fadeOut(50);
    $("#protocol-event-info").fadeOut(50);
    $("#associated-documents").fadeOut(50);
    $("#lineage-info").fadeOut(50);
    $("#protocol-event-info").fadeOut(50);
    $("#sample-review-info").fadeOut(50);
    $("#custom-attributes-div").fadeOut(50);
}



$(document).ready(function () {
        $('#myTable').DataTable();

    var versionNo = $.fn.dataTable.version;
    //alert(versionNo);
    var sample_info = get_sample();
    if (sample_info["success"] == false) {
        $("#screen").fadeOut();
        $("#error").delay(500).fadeIn();
    }

    else {
        var sample_info = sample_info["content"];
        $("#loading-screen").fadeOut();
        get_barcode(sample_info, "qrcode");
    
        fill_title(sample_info);
        fill_basic_information(sample_info);
        fill_custom_attributes(sample_info["attributes"]);
        fill_quantity_chart(sample_info["base_type"], sample_info["quantity"], sample_info["remaining_quantity"]);
        fill_consent_information(sample_info["consent_information"]);
        fill_lineage_table(sample_info["subsamples"]);
        fill_comments(sample_info["comments"]);
        fill_document_information(sample_info["documents"]);
        fill_protocol_events(sample_info["events"]);
        fill_sample_reviews(sample_info["reviews"]);
    
        $("#content").delay(500).fadeIn();
    
    
        $("#qrcode").click(function () {
            get_barcode(sample_info, "qrcode");
    
        });
    
        $("#datamatrix").click(function () {
            get_barcode(sample_info, "datamatrix");
    
        });
    
        $("#print-label-btn").click(function () {
            window.location.href = sample_info["_links"]["label"]
        });
    
        $("#add-cart-btn").click(function() {
            
            $.ajax({
                type: "POST",
                url: sample_info["_links"]["add_sample_to_cart"],
                dataType: "json",
                success: function (data) {
                    if (data["success"]) {
                        $("#cart-confirmation-msg").html(data["content"]["msg"]);
                        $("#cart-confirmation-modal").modal({
                            show: true
                        });
                    }
    
                    else {
                        $("#cart-confirmation-msg").html(data["content"]["msg"]);
                        $("#cart-confirmation-modal").modal({
                            show: true
                        });
                    }
                }
              });
            
        })
    
        $("#basic-info-nav").on("click", function () {
            deactivate_nav();
            $(this).addClass("active");
            hide_all();
            $("#basic-info").fadeIn(100);
        });
    
        $("#custom-attr-nav").on("click", function() {
            deactivate_nav();
            $(this).addClass("active");
            hide_all();
            $("#custom-attributes-div").fadeIn(100);
        });
    
        $("#protocol-events-nav").on("click", function () {
            deactivate_nav();
            $(this).addClass("active");
            hide_all();
            $("#protocol-event-info").fadeIn(100);
        });
    
        $("#sample-review-nav").on("click", function() {
            deactivate_nav();
            $(this).addClass("active");
            hide_all();
            $("#sample-review-info").fadeIn(100);
    
        });
    
        $("#associated-documents-nav").on("click", function () {
            deactivate_nav();
            $(this).addClass("active");
            hide_all();
            $("#associated-documents").fadeIn(100);
        });
    
        $("#lineage-nav").on("click", function () {
            deactivate_nav();
            $(this).addClass("active");
            hide_all();
            $("#lineage-info").fadeIn(100);
        });
    }

    
});