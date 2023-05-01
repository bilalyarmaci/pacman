// Canvas ve context tanımlamaları
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Canvas boyut ayarlaması
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

// Sınırı oluşturan blok parçalarını tutan dizi, yani sınırın ta kendisi
const boundaries = [];

// Sınırları temsil eden harita
// '-' sembolü sınırı oluşturan blok parçacığını (kare) temsil ediyor.
const map = [
    ['-', '-', '-', '-', '-', '-', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', ' ', '-', ' ', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', ' ', '-', ' ', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', '-', '-', '-', '-', '-', '-']
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
    // Hareket efekti için pozisyon (x ve y koordinatları) güncellemesi yaparak 'draw' metodunu çağıran metot
    move() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

// Pacman nesnesi
const pacman = new Pacman({
    // "Pacman"in koordinatlar sınırın (duvarın) içinde kalacak şekilde sınır koordinatlarının değerleri üzerinden verilir
    position: {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity: { // Başlangıç hızı yok - hareket yok
        x: 0,
        y: 0
    }
});

// Basılan klavye tuşlarını tutan dizi
const keys = {
    w: {
        pressed: false
    },
    s: {
        pressed: false
    },
    a: {
        pressed: false
    },
    d: {
        pressed: false
    }
}
// Son basılan tuş
let lastKey = ''

// Tuşun basılmaya başlandığı anı dinler
addEventListener('keydown', ({ key }) => {
    switch (key) {  // Her tuş için durum güncellemesi yapılır. Hareket için 'animation' metodunda bu değerler kullanılıyor.
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            break;
    }
});
// İlgili tuş serbest bırakıldığında durum güncellenir.
addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'w':
            keys.w.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
    }
});

// "Pacman"in tek bir sınır bloğuyla çarpışıp çarpışmadığını hesplayıp döndüren metot
function isColliding({ circle, rectangle }) {
    return (circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x && circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y)
}

// Canvas içerisindeki tüm çizimlerin tekrarlı bir biçimde çağırılmasıyla animasyon görünümü oluşturmakla sorumlu metot
function animate() {
    requestAnimationFrame(animate); // Animasyon için halihazırda var olan fonksiyon
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Bir önceki çizimlerin silinmesini sağlayan fonksiyon

    /* Her animasyon tekrarında (animate metodunun tekrarında) iki kontrol yapılmakta:
    
    I. İlk kontrol sonucunda en son hangi tuş basılıyorsa (aynı anda birden fazla tuşa basıldığında son basılan tuş etki edecektir) o tuşun gerektirdiği hareket "pacman"e verilir,
    ANCAK:
    - Her bir tuş basımında gitmek istenilen yönde sınır (duvar bloğu) var mı diye kontrol edilir.
    - Bir tane dahi olması durumunda o yönde herhangi bir hız (velocity) verilmez (veya sıfır atanır) ve döngü kırılılarak (break) sonlandırılır.
    - Sonuçta engelin olduğu yöne gitme denemesi engellenir (II. kontrolün "pacman"i tamamen durdurması engellenir) ve pacman duvar bloğu çıkana kadar HALİHAZIRDA gitmek olduğu yönde hareketine devam eder. 

    *'lastKey' kontrolü aynı anda birden fazla tuşa basılması durumunda son basılan tuşun dikkate alınması için kullanılır. */
    if (keys.w.pressed && lastKey === 'w') {
        for (let i = 0; i < boundaries.length; i++) {
            let boundary = boundaries[i]
            if (isColliding({
                circle: {
                    ...pacman,
                    velocity: {
                        x: 0,
                        y: -5
                    }
                },
                rectangle: boundary
            })
            ) {
                pacman.velocity.y = 0;
                break;
            } else {
                pacman.velocity.y = -5;
            }
        }
    } else if (keys.s.pressed && lastKey === 's') {
        for (let i = 0; i < boundaries.length; i++) {
            let boundary = boundaries[i]
            if (isColliding({
                circle: {
                    ...pacman,
                    velocity: {
                        x: 0,
                        y: 5
                    }
                },
                rectangle: boundary
            })
            ) {
                pacman.velocity.y = 0;
                break;
            } else {
                pacman.velocity.y = 5;
            }
        }
    } else if (keys.a.pressed && lastKey === 'a') {
        for (let i = 0; i < boundaries.length; i++) {
            let boundary = boundaries[i]
            if (isColliding({
                circle: {
                    ...pacman,
                    velocity: {
                        x: -5,
                        y: 0
                    }
                },
                rectangle: boundary
            })
            ) {
                pacman.velocity.x = 0;
                break;
            } else {
                pacman.velocity.x = -5;
            }
        }
    } else if (keys.d.pressed && lastKey === 'd') {
        for (let i = 0; i < boundaries.length; i++) {
            let boundary = boundaries[i]
            if (isColliding({
                circle: {
                    ...pacman,
                    velocity: {
                        x: 5,
                        y: 0
                    }
                },
                rectangle: boundary
            })
            ) {
                pacman.velocity.x = 0;
                break;
            } else {
                pacman.velocity.x = 5;
            }
        }
    }
    /* II. İkinci kontrol duvar blokları teker teker çizdirilirken her blok için ayrı ayrı yapılır. Bu sayede her bir animasyon dögüsünde pacman herhangi bir şekilde sınır bloğuna çarpması engellenir.
    Bir sonraki adımda çarpacak olması durumunda "pacman"in hareketi durar. */
    boundaries.forEach((boundary) => {
        boundary.draw();
        // Pacman'ın mevcut sınır bloğuna çarpıp çarpmadığının kontrolü
        if (isColliding({ circle: pacman, rectangle: boundary })) {
            pacman.velocity.x = 0;
            pacman.velocity.y = 0;
        };
    });

    pacman.move(); // pacman nesnesinin hareketi için ilgili metot çağırısı
}

animate();