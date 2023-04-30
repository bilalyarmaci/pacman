// Canvas ve context tanımlamaları
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Canvas büyüklük ayarlaması
canvas.width = innerWidth;
canvas.height = innerHeight;

// Oyuncuların ("Pacman"lerin) aşmayacakları sınırı oluşturmak için kullanılacak sınıf yapısı
class Boundary {
    // Nesne üretmeden ulaşılabilen genişlik ve yükseklik parametreleri
    static width = 40;
    static height = 40;
    // Canvas'a çizmek için gerekli olacak pozisyon (x, y) ve genişlil-yükseklik parametrelerini ayarlayan yapıcı (constructor)
    constructor({ position }) {
        this.position = position;
        this.width = Boundary.width;
        this.height = Boundary.height;
    }
    // Nesneyi ekrana çizdiren metot
    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

// Pacman sınıfı
class Pacman {
    // Boundary sınıfındaki yapıcının benzeri
    // Daire oluşturulduğundan yarıçap (radius) değeri de gereklidir
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
    }
    // Nesneyi ("pacman"i) ekrana çizdiren metot
    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();
    }
    // Hareket efekti için pozisyon (x ve y koordinatları) güncellemesi yaparak çizdiren metodu çağıran metot
    move() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

// Sınırı oluşturan blok parçalarını tutan dizi, yani sınırın ta kendisi
const boundaries = [];

// Sınırları temsil eden harita
// '-' sembolü sınırı oluşturan blok parçacığını (kare) temsil ediyor.
const map = [
    ['-', '-', '-', '-', '-', '-'],
    ['-', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', '-', ' ', '-'],
    ['-', ' ', ' ', ' ', ' ', '-'],
    ['-', '-', '-', '-', '-', '-']
];

// Harita satırlarını tarar
// row = satır, i = mevcut satır numarası
map.forEach((row, i) => {
    row.forEach((symbol, j) => { // Satırdaki her elemanı karşılaştırmak için satır içi tarama
        // symbol = o anki indisteki (sütundaki) eleman, j = mevcut indis (sütun) numarası
        switch (symbol) {
            case '-':
                boundaries.push(new Boundary({  // '-' bulunması durumunda sınırı oluşturan diziye blok eklemesi yapılır. Halihazırdaki satır ve sütun değerleri dikkate alınarak pozisyon ataması yapılır.
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    }
                }));
                break;
        }
    });
});

// Pacman nesnesi oluşturuluyor
const pacman = new Pacman({
    // Koordinatlar sınırın (duvarın) içinde kalacak şekilde sınır koordinatlarının değerleri üzerinden veriliyor
    position: {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity: { // Başlangıç hızı yok - hareket yok
        x: 0,
        y: 0
    }
});

// Olay dinleyicinin tanımlanması 
addEventListener('keydown', ({ key }) => {
    switch (key) {
        // Diyagonal bir hareket olmaması için bir eksende sürat varken diğer eksendeki sürat değeri sıfırlanıyor
        case 'a': 
            pacman.velocity.x = -2;
            pacman.velocity.y = 0;
            break;
        case 'd':
            pacman.velocity.x = 2;
            pacman.velocity.y = 0;
            break;
        case 'w':
            pacman.velocity.y = -2;
            pacman.velocity.x = 0;
            break;
        case 's':
            pacman.velocity.y = 2;
            pacman.velocity.x = 0;
            break;
    }
});


// Canvas içerisindeki tüm çizimlerin tekrarlı bir biçimde çağırılmasıyla animasyon görünümü oluşturmakta sorumlu metot
function animate() {
    requestAnimationFrame(animate); // Animasyon için halihazırda var olan fonksiyon
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Bir önceki çizimlerin silinmesini sağlayan fonksiyon
    // Diziyi gezinerek her bir elemanın ilgili metodunu çağırır (Duvarları çizdirir)
    boundaries.forEach(boundary => { boundary.draw(); });
    pacman.move(); // pacman nesnesinin hareketi için ilgili metot çağırısı
}

animate();