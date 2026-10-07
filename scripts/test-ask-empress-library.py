"""Verify source extraction on a small in-memory ZIP, without using live services."""
import contextlib
import importlib.util
import io
import json
import tempfile
import unittest
import zipfile
from pathlib import Path

spec = importlib.util.spec_from_file_location("library", Path(__file__).with_name("prepare-ask-empress-library.py"))
library = importlib.util.module_from_spec(spec)
spec.loader.exec_module(library)


class LibraryTests(unittest.TestCase):
    def test_split_preserves_all_words_and_respects_limit(self):
        text = " ".join(f"word{i}" for i in range(2000))
        chunks = library.split_text(text, 1800)
        self.assertEqual(" ".join(chunks), text)
        self.assertTrue(all(len(c) <= 1800 for c in chunks))

    def test_deduplication_provenance_and_directory_privacy(self):
        with tempfile.TemporaryDirectory() as tmp:
            archive, output = Path(tmp) / "library.zip", Path(tmp) / "output"
            qa = 'Question,Answer,Category\nWhat causes hot flashes?,A supplied educational answer about menopause and vasomotor symptoms.,Menopause\nEmpty answer?,,Menopause\n'
            with zipfile.ZipFile(archive, 'w') as z:
                z.writestr('Q&A - Chatbot/a.csv', qa)
                z.writestr('Q&A - Chatbot/b.csv', qa)
                z.writestr('directory.csv', 'Name,State,Category,Qualification,Website,Email,LinkedIn\nDr Example,CA,Menopause,MD,https://example.com,private@example.com,https://linkedin.com/private\n')
                z.writestr('../unsafe.csv', qa)
                z.writestr('video.txt', 'https://example.com/video')
            with contextlib.redirect_stdout(io.StringIO()):
                library.extract_archive(archive, output)
            records = json.loads((output / 'corpus.json').read_text())
            report = json.loads((output / 'extraction-report.json').read_text())
            self.assertEqual(len(records), 2)
            self.assertEqual(report['duplicate_passages'], 1)
            qa_record = next(r for r in records if r['metadata']['source_type'] == 'educational_qa')
            self.assertEqual(qa_record['metadata']['source_file'], 'Q&A - Chatbot/a.csv')
            self.assertEqual(qa_record['metadata']['source_locator'], 'row 2')
            provider = next(r for r in records if r['metadata']['source_type'] == 'provider_directory')
            self.assertNotIn('private', json.dumps(provider))
            self.assertEqual(report['file_statuses']['excluded_unsafe_archive_entry'], 1)


if __name__ == '__main__':
    unittest.main()
