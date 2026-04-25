from scrapling import StealthyFetcher

def test():
    print("Initializing StealthyFetcher...")
    with StealthyFetcher(headless=True) as fetcher:
        print("Fetcher initialized. Navigating to SCJN...")
        page = fetcher.page
        page.goto("https://bj.scjn.gob.mx/busqueda")
        page.wait_for_timeout(5000)
        title = page.title()
        print(f"Title: {title}")

if __name__ == "__main__":
    test()
