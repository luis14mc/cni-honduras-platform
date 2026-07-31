from django.db import migrations


CMS_MODELS = [
    ("cms", "page"),
    ("cms", "news"),
    ("cms", "document"),
    ("cms", "sitebanner"),
    ("investment", "successstory"),
]

INVESTMENT_VIEW_MODELS = [
    ("investment", "sector"),
    ("investment", "investmentopportunity"),
    ("investment", "investmentproject"),
]

FORMS_VIEW = [
    ("forms_app", "contactsubmission"),
    ("forms_app", "projectapplication"),
    ("forms_app", "advisoryrequest"),
    ("forms_app", "resourcedownloadlead"),
]

MEDIA_VIEW = [
    ("media_library", "mediaasset"),
]


def create_editor_groups(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")
    ContentType = apps.get_model("contenttypes", "ContentType")

    editor, _ = Group.objects.get_or_create(name="Editor")
    publicador, _ = Group.objects.get_or_create(name="Publicador")

    editor_perms = []
    for app_label, model in CMS_MODELS + INVESTMENT_VIEW_MODELS + FORMS_VIEW + MEDIA_VIEW:
        try:
            ct = ContentType.objects.get(app_label=app_label, model=model)
        except ContentType.DoesNotExist:
            continue
        for action in ("add", "change", "view"):
            perm = Permission.objects.filter(content_type=ct, codename=f"{action}_{model}").first()
            if perm:
                editor_perms.append(perm)

    publish_perm = Permission.objects.filter(
        content_type__app_label="cms",
        codename="can_publish",
    ).first()
    if publish_perm:
        publicador_perms = list(editor_perms) + [publish_perm]
    else:
        publicador_perms = list(editor_perms)

    editor.permissions.set(editor_perms)
    publicador.permissions.set(publicador_perms)


def remove_editor_groups(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Group.objects.filter(name__in=["Editor", "Publicador"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("auth", "__latest__"),
        ("cms", "0002_institutionallink_alter_document_options_and_more"),
        ("investment", "0003_alter_successstory_options_and_more"),
    ]

    operations = [
        migrations.RunPython(create_editor_groups, remove_editor_groups),
    ]
