from django.db import migrations, models
import django.db.models.deletion


def backfill_person_name(apps, schema_editor):
    SuccessStory = apps.get_model("investment", "SuccessStory")
    for story in SuccessStory.objects.all().iterator():
        if not story.person_name and story.testimonial_author:
            SuccessStory.objects.filter(pk=story.pk).update(person_name=story.testimonial_author)


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("media_library", "0001_initial"),
        ("investment", "0004_alter_successstory_options"),
    ]

    operations = [
        migrations.AddField(
            model_name="successstory",
            name="featured_image",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="success_story_featured_images",
                to="media_library.mediaasset",
            ),
        ),
        migrations.AddField(
            model_name="successstory",
            name="person_photo",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="success_story_person_photos",
                to="media_library.mediaasset",
            ),
        ),
        migrations.AddField(
            model_name="successstory",
            name="person_name",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
        migrations.AddField(
            model_name="successstory",
            name="person_role",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
        migrations.RunPython(backfill_person_name, noop),
    ]
